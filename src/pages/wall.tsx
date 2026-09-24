import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Move, Plus, Wind, LoaderCircle } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { api, queryClient } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';
import type { WallNote, WallPageData } from '@shared/types';
import { NoteWall } from '@/features/wall/note-wall';
import { NoteComposer, NoteReader } from '@/features/wall/note-dialogs';

const MAX_RENDERED_NOTES = 240;

export function WallPage() {
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const [compose, setCompose] = useState(false);
  const [reading, setReading] = useState<WallNote | null>(null);
  const [shuffle, setShuffle] = useState(0);
  const [windy, setWindy] = useState(false);
  const [focusId, setFocusId] = useState<number | null>(null);
  const [added, setAdded] = useState<WallNote[]>([]);
  const [deleted, setDeleted] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wall = useInfiniteQuery({
    queryKey: ['wall', user?.id || 'guest'],
    initialPageParam: null as number | null,
    queryFn: ({ pageParam, signal }) =>
      api<WallPageData>(`/wall${pageParam ? `?cursor=${pageParam}` : ''}`, { signal }),
    getNextPageParam: (page) => page.nextCursor,
  });
  const notes = useMemo(
    () =>
      Array.from(
        new Map(
          [...added, ...(wall.data?.pages.flatMap((p) => p.items) || [])].map((n) => [n.id, n]),
        ).values(),
      ).filter((n) => !deleted.includes(n.id)),
    [wall.data, added, deleted],
  );
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    setAdded([]);
    setReading(null);
  }, [user?.id]);
  function explore() {
    if (wall.hasNextPage && !wall.isFetchingNextPage && notes.length < MAX_RENDERED_NOTES)
      void wall.fetchNextPage();
  }
  function wind() {
    if (windy || !notes.length) return;
    setWindy(true);
    setShuffle((s) => s + 1);
    timer.current = setTimeout(() => setWindy(false), reduced ? 10 : 850);
    explore();
  }
  return (
    <section className="wall-page">
      <h1 className="sr-only">微光留言墙</h1>
      <div className="wall-workspace">
        {wall.isPending ? (
          <div className="wall-loading" role="status">
            <LoaderCircle className="animate-spin" />
            正在展开纸条…
          </div>
        ) : wall.isError ? (
          <div className="wall-loading">
            <p>纸条暂时没能送达。</p>
            <button onClick={() => void wall.refetch()}>再试一次</button>
          </div>
        ) : (
          <NoteWall
            notes={notes.slice(0, MAX_RENDERED_NOTES)}
            shuffle={shuffle}
            windy={windy}
            focusId={focusId}
            onOpen={setReading}
            onExplore={explore}
          />
        )}
        <div className="wall-drag-hint">
          <Move size={13} />
          <span>
            {windy ? '起风了，换一种相遇。' : '拖动四处逛逛 · 点纸条阅读'}
            {wall.isFetchingNextPage ? ' · 更多心意送达中' : ''}
          </span>
        </div>
      </div>
      <div className="wall-toolbar" aria-label="留言墙工具">
        <button onClick={wind} disabled={windy || !notes.length}>
          <Wind size={19} />
          <span>{windy ? '起风了' : '起一阵风'}</span>
        </button>
        <button className="wall-write" onClick={() => setCompose(true)}>
          <Plus size={19} />
          <span>贴张纸条</span>
        </button>
      </div>
      <span className="wall-footer-note" aria-hidden="true">
        EVERY LITTLE WORD MATTERS.
      </span>
      <NoteComposer
        open={compose}
        onClose={() => setCompose(false)}
        onPosted={(note) => {
          setAdded((old) => [note, ...old]);
          setFocusId(note.id);
          void queryClient.invalidateQueries({ queryKey: ['wall'] });
        }}
      />
      <NoteReader
        note={reading}
        onClose={() => setReading(null)}
        onDeleted={(id) => {
          setDeleted((old) => [...old, id]);
          void queryClient.invalidateQueries({ queryKey: ['wall'] });
        }}
      />
    </section>
  );
}
