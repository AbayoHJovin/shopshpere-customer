"use client";

import { FC } from "react";

interface AccountHeaderProps {
  title: string;
  subtitle?: string;
}

const AccountHeader: FC<AccountHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default AccountHeader;
