type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header
      style={{
        background: "#6200ee",
        color: "white",
        padding: "1rem 2rem",
      }}
    >
      <h1>{title}</h1>
    </header>
  );
}