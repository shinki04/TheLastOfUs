import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import * as React from "react";
import { signInWithAzure, signInWithGithub } from "../auth/action";
import Image from "next/image";
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
      <Button onClick={signInWithAzure}>
        <Image
          src="/icons/azure/10018-icon-service-Azure-A.svg"
          alt="Azure Logo"
          width={10}
          height={10}
        />
        <span></span>
        Login with azure
      </Button>
    </div>
  );
};

export default LoginPage;
