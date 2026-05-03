const avatarMap = {
  female:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  male:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "non-binary":
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  "prefer-not-to-say":
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
};

const AvatarBadge = ({ gender = "prefer-not-to-say", name = "NewsSnap user", size = "lg", avatarUrl }) => {
  const imageUrl = avatarUrl || avatarMap[gender] || avatarMap["prefer-not-to-say"];
  const initials = name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`avatar-badge avatar-badge--${size}`}>
      <img src={imageUrl} alt="" onError={(e) => { e.target.src = avatarMap[gender]; }} />
      {!avatarUrl && <span>{initials}</span>}
    </div>
  );
};

export default AvatarBadge;
