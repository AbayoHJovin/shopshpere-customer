import { ProductPageClient } from "./ProductPageClient";
import { Metadata } from "next";

type Params = {
  id: string;
};

type Props = {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  return <ProductPageClient productId={resolvedParams.id} />;
}