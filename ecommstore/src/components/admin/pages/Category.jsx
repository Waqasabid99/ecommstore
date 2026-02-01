"use client";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import { Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const Category = ({ categories }) => {
  const { adminID } = useParams();
  const navigate = useRouter();
  return (
    <section>
      <DashboardHeadingBox
        text="Categories"
        subHeading={"View all your categories"}
        button={ <button onClick={() => navigate.push(`/admin/${adminID}/categories/new`)} className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-(--border-default) hover:rounded hover:p-3"> Add Category </button> }
      />

      <Table
        columns={[
          {
            header: "Name",
            key: "name",
          },
          {
            header: "Slug",
            key: "slug",
          },
          {
            header: "Total Products",
            key: "totalProducts",
            render: (_, category) => category._count.products, // nested value
          },
        ]}
        data={categories}
        actions={ (item) => (
            <button onClick={() => navigate.push(`/admin/${adminID}/categories/${item.id}`)} className="p-2 hover:bg-black hover:text-white hover:rounded hover:p-2"> <Edit size={16} /> </button>
        ) }
      />
    </section>
  );
};

export default Category;
