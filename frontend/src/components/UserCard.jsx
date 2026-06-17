import Badge from "./Badge";

export default function UserCard({ name, age }) {
  return (
    <div>
      <p>{name}</p>
      <Badge age={age} />
    </div>
  );
}
