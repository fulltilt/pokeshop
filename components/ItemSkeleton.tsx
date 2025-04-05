import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function ItemSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center py-6">
        <Skeleton className="h-[225px] w-[150px]" />
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
}
