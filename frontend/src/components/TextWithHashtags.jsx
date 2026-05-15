import { Link } from 'react-router-dom';

export default function TextWithHashtags({ text }) {
  if (!text) return null;

  // Regex to find hashtags: starts with # followed by alphanumeric characters
  const parts = text.split(/(#[a-z0-9_]+)/gi);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <Link
              key={i}
              to={`/explore?q=${tag}`}
              className="text-blue-500 hover:underline hover:text-blue-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </>
  );
}
