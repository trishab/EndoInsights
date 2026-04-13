export default function DoctorCard({ doctor = {} }) {
  const { name = 'Unnamed Doctor', city = '', state = '' } = doctor;

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h2 className="text-lg font-bold text-blue-800">{name}</h2>
      <p className="text-sm text-gray-600">{city}, {state}</p>
    </div>
  );
}
