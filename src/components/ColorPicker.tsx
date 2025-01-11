import React, { useState, useEffect } from "react";
import { Radio, RadioGroup, Box, Popover, ButtonBase } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SquareRoundedIcon from "@mui/icons-material/SquareRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import {
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@mui/material/colors";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
};

const defaultColors = [
  red[500],
  orange[700],
  yellow[600],
  green[500],
  blue[500],
  purple[400],
  grey[500],
];

const miscColors = [
  brown[600],
  pink[500],
  deepOrange[700],
  deepPurple[500],
  blueGrey[500],
  indigo[500],
  cyan[500],
  teal[500],
  lightGreen[500],
  lime[500],
];

const STORAGE_KEY = "colorPicker.availableColors";

const ColorPicker = ({
  value,
  onChange,
  colors = defaultColors,
}: ColorPickerProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [availableColors, setAvailableColors] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : colors;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(availableColors));
  }, [availableColors]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🚀 ~ handleClick ~ event:", event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddColor = (color: string) => {
    setAvailableColors((prev) => [...prev, color]);
    onChange(color);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "color-popover" : undefined;

  return (
    <Box>
      <RadioGroup
        row
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          flex: 1,
        }}
      >
        {availableColors.map((color) => (
          <Radio
            key={color}
            value={color}
            icon={<CircleIcon sx={{ color: color }} />}
            checkedIcon={<CheckCircleIcon sx={{ color: color }} />}
          />
        ))}
        <ButtonBase onClick={handleClick}>
          <AddCircleOutlineIcon sx={{ fontSize: 28, margin: 1 }} />
        </ButtonBase>
      </RadioGroup>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box p={2} maxWidth={260}>
          <RadioGroup
            row
            value={value}
            onChange={(e) => handleAddColor(e.target.value)}
          >
            {miscColors.map((color, index) => (
              <Radio
                key={index}
                value={color}
                sx={{
                  padding: 0.25,
                }}
                icon={<SquareRoundedIcon sx={{ color: color, fontSize: 32 }} />}
                checkedIcon={
                  <CheckBoxRoundedIcon sx={{ color: color, fontSize: 32 }} />
                }
              />
            ))}
          </RadioGroup>
        </Box>
      </Popover>
    </Box>
  );
};

export default ColorPicker;
