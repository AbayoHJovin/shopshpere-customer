"use client";

import { FC } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const AccountSettingsCard: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </CardTitle>
        <CardDescription>Update your account settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href="/account/profile">
            <Button variant="outline" className="w-full justify-start">Edit Profile</Button>
          </Link>
          <Link href="/account/password">
            <Button variant="outline" className="w-full justify-start">Change Password</Button>
          </Link>
          <Link href="/account/addresses">
            <Button variant="outline" className="w-full justify-start">Manage Addresses</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettingsCard;
