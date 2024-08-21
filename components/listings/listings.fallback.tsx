import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ListingsFallback() {
  return (
    <div className="as">
      {[...Array(5)].map((_, index) => (
        <Card
          className="my-4 w-full"
          // eslint-disable-next-line react/no-array-index-key -- safe to use index as key here
          key={index}
        >
          <CardContent className="space-y-4 p-6">
            <div
              key={index}
              className="flex items-center justify-between space-x-2"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
              <Skeleton className="h-4 w-[40px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
