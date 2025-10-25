import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import * as React from "react";
import { signInWithGithub } from "../auth/action";

interface LoginPageProps {
  propName: string;
}

const LoginPage: React.FC<LoginPageProps> = () => {
  return (
    <div>
      <Button onClick={signInWithGithub}>
        <span>
          <Github />
        </span>
        Click me
      </Button>
    </div>
  );
};

export default LoginPage;
