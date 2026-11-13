import {
  TextField, Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import { Upload, Spin } from "antd";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--accent)",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--accent)" },
};

// 新增 / 編輯場地 Dialog（純 UI，狀態由 useRoomManager 提供）
const RoomFormDialog = ({
  open, onClose, editingId,
  formValues, setFormValues, onFormChange,
  pendingFile, setPendingFile, saving, aiLoading,
  customFacility, setCustomFacility,
  onSave, onGenerate,
}) => {
  const addCustomFacility = () => {
    const v = customFacility.trim();
    if (v && !formValues.facilities.includes(v)) {
      setFormValues((prev) => ({ ...prev, facilities: [...prev.facilities, v] }));
    }
    setCustomFacility("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "10px", fontFamily: "var(--font-sans)" } }}
    >
      <DialogTitle sx={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 17, color: "var(--text)", pb: 1 }}>
        {editingId ? "編輯場地" : "新增場地"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
            {/* 場地圖片上傳 */}
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>場地圖片</div>
              <div style={{ position: "relative" }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  rootClassName="room-img-upload"
                  customRequest={({ file, onSuccess }) => {
                    const previewUrl = URL.createObjectURL(file);
                    setPendingFile({ file, previewUrl });
                    onSuccess({});
                  }}
                >
                  <Spin spinning={saving && !!pendingFile}>
                    {(pendingFile?.previewUrl || formValues.roomImg) ? (
                      <div style={{ position: "relative", width: "100%", cursor: "pointer", borderRadius: 8, overflow: "hidden" }}>
                        <img
                          src={pendingFile?.previewUrl || formValues.roomImg}
                          alt="場地圖片"
                          style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                        />
                        <div style={{
                          position: "absolute", inset: 0, background: "rgba(0,0,0,0)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "background 0.2s",
                          fontSize: 13, color: "white", fontFamily: "var(--font-sans)", fontWeight: 500,
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.45)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0)"; }}
                        >
                          點擊更換圖片
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        width: "100%", height: 120, border: "1.5px dashed var(--border)",
                        borderRadius: 8, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 6,
                        cursor: "pointer", background: "var(--bg)",
                        transition: "border-color 0.15s",
                        fontFamily: "var(--font-sans)",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      >
                        <span style={{ fontSize: 22, opacity: 0.4 }}>↑</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>點擊或拖曳上傳圖片</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.7 }}>JPG、PNG、WebP</span>
                      </div>
                    )}
                  </Spin>
                </Upload>

                {/* × 移除按鈕：疊在圖片右上角，與 Upload 分離避免觸發 file picker */}
                {(pendingFile?.previewUrl || formValues.roomImg) && (
                  <button
                    type="button"
                    onClick={() => { setFormValues((prev) => ({ ...prev, roomImg: "" })); setPendingFile(null); }}
                    style={{
                      position: "absolute", top: 8, right: 8,
                      width: 26, height: 26, borderRadius: "50%",
                      border: "none", background: "rgba(0,0,0,0.55)",
                      color: "white", fontSize: 15, lineHeight: 1,
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", zIndex: 2,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.8)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
                    title="移除圖片"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <TextField size="small" label="場地名稱 *" name="title"
              value={formValues.title} onChange={onFormChange} fullWidth sx={fieldSx} />
            {/* 場地說明 + AI 按鈕 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>場地說明</div>
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={aiLoading}
                  title={!formValues.title.trim() ? "請先填入場地名稱" : "根據標題與圖片，AI 自動生成場地說明"}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "4px 11px", borderRadius: 6,
                    border: "1px solid var(--accent)",
                    background: aiLoading ? "var(--accent-light)" : "transparent",
                    color: aiLoading ? "var(--text-muted)" : "var(--accent)",
                    fontSize: 11, fontFamily: "var(--font-sans)",
                    cursor: aiLoading ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!aiLoading) e.currentTarget.style.background = "var(--accent-light)"; }}
                  onMouseLeave={(e) => { if (!aiLoading) e.currentTarget.style.background = "transparent"; }}
                >
                  {aiLoading
                    ? <><Spin size="small" style={{ marginRight: 2 }} /> AI 生成中…</>
                    : <>✦ AI 生成場地說明</>
                  }
                </button>
              </div>
              <TextField size="small" name="desc"
                value={formValues.desc} onChange={onFormChange} fullWidth multiline rows={2} sx={fieldSx} />
            </div>

            {/* ── 場地標籤 ───────────────────────────────────── */}
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>場地標籤</div>

              {/* 已選標籤（accent 風格，有 × 可移除） */}
              {formValues.facilities.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6,
                  padding: "8px 10px", background: "var(--bg)",
                  borderRadius: 8, marginBottom: 8,
                  border: "1px solid var(--border-light)",
                }}>
                  {formValues.facilities.map((f) => (
                    <span key={f} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 8px 3px 10px", borderRadius: 20,
                      background: "var(--accent-light)", border: "1px solid var(--accent)",
                      color: "var(--accent)", fontSize: 11, fontFamily: "var(--font-sans)",
                    }}>
                      {f}
                      <button
                        type="button"
                        onClick={() => setFormValues((prev) => ({ ...prev, facilities: prev.facilities.filter((x) => x !== f) }))}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "0 2px", color: "var(--accent)", fontSize: 13, lineHeight: 1,
                          display: "flex", alignItems: "center", opacity: 0.7,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 自訂輸入 */}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  placeholder="輸入標籤"
                  value={customFacility}
                  onChange={(e) => setCustomFacility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomFacility();
                    }
                  }}
                  style={{
                    flex: 1, height: 34, padding: "0 10px",
                    border: "1px solid var(--border)", borderRadius: 7,
                    fontSize: 12, fontFamily: "var(--font-sans)",
                    background: "var(--surface)", color: "var(--text)", outline: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
                <button
                  type="button"
                  onClick={addCustomFacility}
                  style={{
                    padding: "0 14px", height: 34, background: "var(--accent)",
                    border: "none", borderRadius: 7, color: "white",
                    fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
                >
                  新增
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: -6 }}>場地費用（NT$）</div>
            <Grid container spacing={1}>
              {[["上午", "morning"], ["下午", "afternoon"], ["晚上", "night"]].map(([label, key]) => (
                <Grid item xs={4} key={key}>
                  <TextField size="small" type="number" label={label} name={`price.${key}`}
                    value={formValues.price[key]} onChange={onFormChange} fullWidth sx={fieldSx} />
                </Grid>
              ))}
            </Grid>
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <button
          onClick={onClose}
          style={{ padding: "8px 20px", background: "transparent", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          style={{ padding: "8px 20px", background: "var(--accent)", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", transition: "background 0.15s", opacity: saving ? 0.7 : 1 }}
          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--accent-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomFormDialog;
