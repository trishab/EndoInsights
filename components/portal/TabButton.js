export default function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
        active
          ? 'border-primary text-primary font-semibold'
          : 'border-transparent text-secondary-light hover:text-secondary-dark'
      }`}
    >
      {label}
    </button>
  );
}
