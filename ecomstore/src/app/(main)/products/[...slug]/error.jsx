'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h1>Error Loading Product</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
