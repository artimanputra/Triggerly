"use client";

import { Suspense } from "react";
import { Appbar } from "../../components/Appbar";
import { DarkButton } from "../../components/buttons/DarkButton";
import ProtectedRoute from "../../components/ProtectedRoute";
import axios from "axios";
import { useEffect, useState } from "react";
// import { NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_HOOKS_URL } from "../config";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Zap } from "../../types/zap";
import { Pencil, Trash } from "lucide-react";
import { LoaderOneDemo } from "@/components/LoaderOneDemo ";

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setZaps(res.data.zaps);
        setLoading(false);
      });
  }, []);

  return { loading, zaps };
}

function DashboardPageInner() {
  const { loading, zaps } = useZaps();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatedZapId = searchParams.get("updatedZapId");
  const updatedZapName = searchParams.get("updatedZapName");

  const [zapList, setZapList] = useState<Zap[]>(zaps);

  useEffect(() => {
    setZapList(zaps);
    console.log("Zaps updated: ", zaps);
  }, [zaps]);

  // patch if query params exist, then clear them
  useEffect(() => {
    if (updatedZapId && updatedZapName) {
      setZapList((prev) =>
        prev.map((z) =>
          z.id === updatedZapId ? { ...z, name: updatedZapName } : z
        )
      );
      // clear query params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [updatedZapId, updatedZapName]);

  return (
    <ProtectedRoute>
      <Appbar />
      <div className="flex justify-center pt-8">
        <div className="max-w-screen-lg w-full">
          <div className="flex justify-between pr-8">
            <div className="text-2xl font-bold">My Zaps</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
              }}
            >
              Create
            </DarkButton>
          </div>
        </div>
      </div>
      {loading ? (
        <LoaderOneDemo />
      ) : (
        <div className="flex justify-center">
          <ZapTable zaps={zapList} setZapList={setZapList} />
        </div>
      )}
    </ProtectedRoute>
  );
}

// ✅ Wrapper with Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<LoaderOneDemo />}>
      <DashboardPageInner />
    </Suspense>
  );
}

function ZapTable({
  zaps,
  setZapList,
}: {
  zaps: Zap[];
  setZapList: React.Dispatch<React.SetStateAction<Zap[]>>;
}) {
  const router = useRouter();

  const handleToggle = async (zapId: string, currentStatus: boolean) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap/${zapId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: localStorage.getItem("token") } }
      );

      setZapList((prev) =>
        prev.map((z) =>
          z.id === zapId ? { ...z, isActive: !currentStatus } : z
        )
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };
  return (
    <div className="p-8 max-w-screen-lg w-full">
      {/* Table header */}
      <div className="hidden sm:grid grid-cols-5 font-semibold border-b pb-2">
        <div>Name</div>
        <div>Apps</div>
        <div>Last modified</div>
        <div>Status</div>
        <div>Webhook URL</div>
      </div>

      {/* Table rows */}
      {zaps.map((z) => (
        <div
          key={z.id}
          className="
          grid gap-4 border-b py-4 
          sm:grid-cols-5 
          grid-cols-1
        "
        >
          {/* Name */}
          <div
            className="text-blue-500 cursor-pointer hover:underline truncate"
            onClick={() => router.push("/zap/" + z.id)}
          >
            <span className="block sm:hidden font-semibold">Name:</span>
            {z.name || "Untitled"}
          </div>

          {/* Apps */}
          <div className="flex gap-2 items-center">
            <span className="block sm:hidden font-semibold">Apps:</span>
            <Image
              src={z.trigger.type.image}
              width={24}
              height={24}
              alt={z.trigger.type.name}
              className="w-6 h-6 object-contain"
            />
            {z.actions.map((x, index) => (
              <Image
                key={x.id ?? index}
                src={x.type.image}
                width={24}
                height={24}
                alt={x.type.name}
                className="w-6 h-6 object-contain"
              />
            ))}
          </div>
          {/* Last modified */}
          <div>
            <span className="block sm:hidden font-semibold">Last modified:</span>
            {new Date(z.updatedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* Status toggle */}
          <div>
            <span className="block sm:hidden font-semibold">Status:</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={z.isActive}
                onChange={() => handleToggle(z.id, z.isActive)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Webhook URL + actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="block sm:hidden font-semibold">Webhook URL:</span>
            {z.trigger.metadata.cronExpr ? (
              <span className="italic text-gray-500">Scheduled Trigger</span>
            ) : (
              <div className="flex items-center gap-2 group max-w-[250px]">
                <span
                  className="truncate text-sm text-gray-500"
                  title={`${process.env.NEXT_PUBLIC_HOOKS_URL}/hooks/catch/1/${z.id}`}
                >
                  {`${process.env.NEXT_PUBLIC_HOOKS_URL}/hooks/catch/1/${z.id}`}
                </span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_HOOKS_URL}/hooks/catch/1/${z.id}`);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700"
                  title="Copy URL"
                >
                  📋
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => router.push("/zap/" + z.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this Zap?")) {
                    try {
                      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap/${z.id}`, {
                        headers: { Authorization: localStorage.getItem("token") },
                      });
                      setZapList((prev) => prev.filter((zap) => zap.id !== z.id));
                    } catch (err) {
                      console.error("Failed to delete zap:", err);
                      alert("Failed to delete zap");
                    }
                  }
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

}
