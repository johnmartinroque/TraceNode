import { useEffect } from "react";
import { supabase } from "./lib/supabase";

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from("test").select("*");

      if (error) {
        console.log("Error:", error.message);
      } else {
        console.log("Data:", data);
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h1>Supabase Connected</h1>
    </div>
  );
}

export default App;
