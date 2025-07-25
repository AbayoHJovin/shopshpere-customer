import { ProductPageClient } from "./ProductPageClient";
import { Metadata } from "next";

type Params = {
  id: string;
};

type Props = {
  params: Params;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ProductPage({ params, searchParams }: Props) {
  return <ProductPageClient productId={params.id} />;
} 