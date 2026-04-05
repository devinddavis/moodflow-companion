import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "@/lib/mood-store";

const Index = () => {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return null;
};

export default Index;
