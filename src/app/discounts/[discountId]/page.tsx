import { DiscountPageClient } from "./DiscountPageClient";
import { Metadata } from "next";

type Params = {
  discountId: string;
};

type Props = {
  params: Params;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function DiscountPage({ params, searchParams }: Props) {
  return <DiscountPageClient discountId={params.discountId} />;
}
