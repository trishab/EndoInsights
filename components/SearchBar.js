export default function SearchBar({ query, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder="Search doctors..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
      />
    </div>
  );
}
