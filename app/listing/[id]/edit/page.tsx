export default async function DownloadListingPage({
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
