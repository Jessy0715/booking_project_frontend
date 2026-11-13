import { useState } from "react";
import { message as antdMsg } from "antd";
import {
  useSearchRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useDeleteRoomsMutation,
  useUploadImageMutation,
  useGenerateRoomDescriptionMutation,
} from "@/services/bookingApi.generated";

export const EMPTY_FORM = { roomImg: "", title: "", desc: "", facilities: [], price: { morning: "", afternoon: "", night: "" } };

const showMsg = (text, severity = "success") => {
  if (severity === "error") antdMsg.error(text);
  else if (severity === "warning") antdMsg.warning(text);
  else antdMsg.success(text);
};

// 場地管理的狀態與事件處理。roomKeyword 由父層持有（預約審核的場地下拉共用同一份搜尋結果）。
export const useRoomManager = ({ roomKeyword, onKeywordChange }) => {
  const [filter, setFilter]           = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formValues, setFormValues]   = useState(EMPTY_FORM);
  const [selectedIds, setSelectedIds] = useState([]);
  const [roomPage, setRoomPage]               = useState(0);
  const [roomRowsPerPage, setRoomRowsPerPage] = useState(5);
  const [pendingFile, setPendingFile]         = useState(null); // { file: File, previewUrl: string }
  const [saving, setSaving]                   = useState(false);
  const [aiLoading, setAiLoading]             = useState(false);
  const [customFacility, setCustomFacility]   = useState("");

  const { data: roomsData, isLoading: roomsLoading, isError: roomsError, refetch: refetchRooms } =
    useSearchRoomsQuery({ keyword: roomKeyword || undefined, pageSize: 100 });
  const rooms = roomsData?.data ?? [];

  const [createRoomApi]           = useCreateRoomMutation();
  const [updateRoomApi]           = useUpdateRoomMutation();
  const [deleteRoomApi]           = useDeleteRoomMutation();
  const [deleteRoomsApi]          = useDeleteRoomsMutation();
  const [uploadImageApi]         = useUploadImageMutation();
  const [generateDescriptionApi] = useGenerateRoomDescriptionMutation();

  const submitSearch = () => { onKeywordChange(filter); setRoomPage(0); };
  const handleFilterChange = (value) => {
    setFilter(value);
    if (!value) { onKeywordChange(""); setRoomPage(0); }
  };
  const handleClearSearch = () => { setFilter(""); onKeywordChange(""); setRoomPage(0); };

  const handleOpenAdd = () => {
    setEditingId(null); setFormValues(EMPTY_FORM); setPendingFile(null); setCustomFacility(""); setIsModalOpen(true);
  };
  const handleOpenEdit = (room) => {
    setEditingId(room.id);
    setPendingFile(null);
    setCustomFacility("");
    setFormValues({
      roomImg:    room.roomImg    ?? "",
      title:      room.title     ?? "",
      desc:       room.desc      ?? "",
      facilities: room.facilities ?? [],
      price: {
        morning:   String(room.price?.morning   ?? ""),
        afternoon: String(room.price?.afternoon ?? ""),
        night:     String(room.price?.night     ?? ""),
      },
    });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("price.")) {
      const key = name.split(".")[1];
      setFormValues((prev) => ({ ...prev, price: { ...prev.price, [key]: value } }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerateDescription = async () => {
    if (!formValues.title.trim()) { showMsg("請先填入場地名稱", "warning"); return; }
    setAiLoading(true);
    try {
      let roomImg = formValues.roomImg || "";
      // 有本地待上傳的圖片時，先上傳取得 URL
      if (pendingFile && !roomImg) {
        const formData = new FormData();
        formData.append("file", pendingFile.file);
        const uploadRes = await uploadImageApi({ body: formData }).unwrap();
        roomImg = uploadRes.data?.url || "";
        setFormValues((prev) => ({ ...prev, roomImg }));
        setPendingFile(null);
      }
      const res = await generateDescriptionApi({
        roomDescriptionRequest: { title: formValues.title, roomImg },
      }).unwrap();
      if (!res.success) {
        showMsg(res.message || "AI 生成失敗", "error");
        return;
      }
      const desc = res.data?.description;
      if (desc) {
        setFormValues((prev) => ({ ...prev, desc }));
        showMsg("AI 已自動生成場地說明", "success");
      } else {
        showMsg("AI 未能產出說明，請手動填寫", "warning");
      }
    } catch (err) {
      console.error('[AI描述] err:', err);
      showMsg(err?.data?.message || err?.message || "AI 生成失敗，請稍後再試", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formValues.title.trim()) { showMsg("場地名稱為必填", "warning"); return; }
    setSaving(true);
    try {
      let roomImg = formValues.roomImg || undefined;
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile.file);
        const res = await uploadImageApi({ body: formData }).unwrap();
        roomImg = res.data?.url || undefined;
      }
      const roomCreateRequest = {
        title:      formValues.title,
        roomImg,
        desc:       formValues.desc       || undefined,
        facilities: formValues.facilities.length > 0 ? formValues.facilities : undefined,
        price: {
          morning:   Number(formValues.price.morning)   || undefined,
          afternoon: Number(formValues.price.afternoon) || undefined,
          night:     Number(formValues.price.night)     || undefined,
        },
      };
      if (editingId) {
        await updateRoomApi({ id: editingId, roomCreateRequest }).unwrap();
        showMsg("場地已更新");
      } else {
        await createRoomApi({ roomCreateRequest }).unwrap();
        showMsg("場地已新增");
      }
      setIsModalOpen(false);
      setPendingFile(null);
      refetchRooms();
    } catch (err) {
      showMsg(err?.data?.message || "操作失敗", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoomApi({ id }).unwrap();
      showMsg("場地已刪除");
      refetchRooms();
    } catch (err) {
      showMsg(err?.data?.message || "刪除失敗", "error");
    }
  };

  const handleBatchDelete = async () => {
    const count = selectedIds.length;
    try {
      await deleteRoomsApi({ ids: selectedIds }).unwrap();
      setSelectedIds([]);
      showMsg(`已刪除 ${count} 筆場地`);
      refetchRooms();
    } catch (err) {
      showMsg(err?.data?.message || "批次刪除失敗", "error");
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const roomTotalPages = Math.ceil(rooms.length / roomRowsPerPage) || 1;
  const pagedRooms     = rooms.slice(roomPage * roomRowsPerPage, roomPage * roomRowsPerPage + roomRowsPerPage);

  return {
    filter, handleFilterChange, submitSearch, handleClearSearch,
    rooms, roomsLoading, roomsError, pagedRooms,
    roomPage, setRoomPage, roomRowsPerPage, setRoomRowsPerPage, roomTotalPages,
    selectedIds, toggleSelect, handleBatchDelete, handleDelete,
    handleOpenAdd, handleOpenEdit,
    dialog: {
      open: isModalOpen, onClose: handleCloseModal, editingId,
      formValues, setFormValues, onFormChange: handleFormChange,
      pendingFile, setPendingFile, saving, aiLoading,
      customFacility, setCustomFacility,
      onSave: handleSave, onGenerate: handleGenerateDescription,
    },
  };
};
