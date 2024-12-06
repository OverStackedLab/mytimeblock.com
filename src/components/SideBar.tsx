import { ReactNode } from "react";
import { Drawer } from "@mui/material";

type SideBarProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
};

const SideBar = ({ children, open, onClose }: SideBarProps) => {
  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={onClose}
      hideBackdrop={false}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {children}
    </Drawer>
  );
};

export default SideBar;
