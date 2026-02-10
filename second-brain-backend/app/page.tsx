export default function Home() {
  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#000" 
    }}>
      <div style={{ color: "white", fontSize: "40px", textAlign: "center" }}>
        ✅ Second Brain Backend is Working!
        <div style={{ fontSize: "20px", marginTop: "20px", color: "#888" }}>
          API running at /api/knowledge
        </div>
      </div>
    </div>
  );
}