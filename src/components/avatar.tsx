import { Link } from 'react-router-dom';
import type { Member } from '@shared/types';
import { cn } from '@/lib/utils';
export function Avatar({
  member,
  className,
  link = true,
}: {
  member: Member;
  className?: string;
  link?: boolean;
}) {
  const content = (
    <span
      className={cn('avatar', className)}
      style={{ backgroundColor: `color-mix(in srgb, ${member.color} 65%, #253122)` }}
      aria-hidden="true"
      title={member.name}
    >
      {member.name.slice(0, 1)}
    </span>
  );
  return link ? (
    <Link to={`/members/${member.id}`} aria-label={`查看${member.name}的纪念册`}>
      {content}
    </Link>
  ) : (
    content
  );
}
export function AvatarGroup({ members }: { members: Member[] }) {
  return (
    <div className="avatar-group">
      {members.slice(0, 4).map((m) => (
        <Avatar key={m.id} member={m} />
      ))}
      {members.length > 4 && (
        <span
          className="avatar more-avatar"
          title={members
            .slice(4)
            .map((m) => m.name)
            .join('、')}
        >
          +{members.length - 4}
        </span>
      )}
    </div>
  );
}
