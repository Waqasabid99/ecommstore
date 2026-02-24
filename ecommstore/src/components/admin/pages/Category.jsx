"use client";
import { deleteCategoryAction } from "@/actions/category.action";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import { Edit, LoaderIcon, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const Category = ({ categories }) => {
  console.log(categories);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting ] = useState(null);
  const { adminID } = useParams();
  const navigate = useRouter();
  function flattenCategories(categories, level = 0, parentName = null) {
    return categories.flatMap((category) => {
      const current = {
        ...category,
        level,
        parentName,
        isChild: level > 0,
      };

      const children = category.children?.length
        ? flattenCategories(category.children, level + 1, category.name)
        : [];

      return [current, ...children];
    });
  }
  
  const flatCategories = flattenCategories(categories);

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      const result = await deleteCategoryAction(id);
      console.log(result)
      if (result.success) {
        setIsLoading(false);
        setIsDeleting(null);
        toast.success("Category deleted successfully");
        navigate.push(`/admin/${adminID}/categories`);
      } else {
        setIsLoading(false);
        setIsDeleting(null);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message)
      setIsDeleting(null);
    }
  };
  const DeleteModel = ({ id }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded px-12 py-10 flex flex-col gap-3 items-center">
          <h1 className="text-2xl font-semibold">Delete Category</h1>
          <p className="text-gray-400">
            Are you sure you want to delete this category?
          </p>
          <div className="flex items-center gap-5">

        <button onClick={() => setIsDeleting(null)} className="bg-black text-white px-3 py-2 rounded border hover:bg-white hover:text-black hover:border hover:border-(--border-default) flex items-center gap-2">< X size={16} /> Cancel</button>  
        <button
          onClick={() => handleDelete(id)}
          className="flex items-center gap-2 bg-red-500 text-white rounded font-semibold px-3 py-2 border border-transparent hover:text-white hover:bg-black hover:border hover:border-(--border-default) hover:rounded hover:px-3 hover:py-2"
        > 
          {isLoading ? (
            <LoaderIcon size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16}/>
          )}
          Delete
        </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <ToastContainer />
      <DashboardHeadingBox
        text="Categories"
        subHeading={"View all your categories"}
        button={
          <>
            <button
              onClick={() => navigate.refresh()}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-(--border-default) hover:rounded hover:p-3"
            >
              {" "}
              Refresh{" "}
            </button>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/categories/new`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-(--border-default) hover:rounded hover:p-3"
            >
              {" "}
              Add Category{" "}
            </button>
          </>
        }
      />  

      {isDeleting && <DeleteModel id={isDeleting} />}

      <Table
        data={flatCategories}
        columns={[
          {
            header: "Name",
            key: "name",
            render: (_, category) => (
              <div className="flex items-center gap-2">
                {category.level > 0 && (
                  <span className="text-gray-400">
                    {"—".repeat(category.level)}
                  </span>
                )}
                <span>{category.name}</span>
              </div>
            ),
          },
          {
            header: "Child Categories",
            key: "children",
            render: (_, category) =>
              category.children.map((child) => child.name).join(", "), // nested value
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
        actions={(item) => (
          <div>
            <button
              onClick={() =>
                navigate.push(`/admin/${adminID}/categories/${item.id}`)
              }
              className="p-2 hover:bg-black hover:text-white hover:rounded hover:p-2"
            >
              <Edit size={16} />
            </button>
            <button
               onClick={() => setIsDeleting(item.id)}
              className="p-2 hover:bg-black hover:text-white hover:rounded hover:p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />
    </section>
  );
};

export default Category;
