export default async function CheckoutListingPage({
  params: { id },
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1>Listing {id}</h1>
    </div>
  )
}
