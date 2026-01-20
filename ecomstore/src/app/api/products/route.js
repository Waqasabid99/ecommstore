export async function GET(request) {
  // Fetch products from your database or API
  return Response.json({ products: [] });
}

export async function POST(request) {
  // Create a new product
  return Response.json({ message: 'Product created' }, { status: 201 });
}
