import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import SquareRoundedIcon from "@mui/icons-material/SquareRounded";
import { Box, ButtonBase, Popover, Radio, RadioGroup } from "@mui/material";
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
import React, { useContext, useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Context } from "../context/AuthContext";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import {
  fetchPreferences,
  selectPreferences,
  updatePreferences,
} from "../services/preferencesSlice";
import type { FormValues } from "./EventEditor";

type ColorPickerProps = {
  value?: string;
  onChange?: (color: string) => void;
  colors?: string[];
  control?: Control<FormValues>;
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

const optionalColors = [
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

const adminEmails = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL.split(",");

const ColorPicker = ({
  value = orange[700],
  onChange = () => {},
  control,
}: ColorPickerProps) => {
  const { eventSwatches } = useAppSelector(selectPreferences);
  const dispatch = useAppDispatch();
  const { user } = useContext(Context);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [swatches, setSwatches] = useState<string[]>(() => {
    const stored = eventSwatches;
    return stored.length > 0 ? stored : defaultColors;
  });

  useEffect(() => {
    if (user?.uid && adminEmails.includes(user?.email || "")) {
      dispatch(fetchPreferences(user?.uid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddColor = (color: string) => {
    setSwatches((prev) => {
      if (prev.includes(color)) {
        return prev;
      }
      if (user && user?.uid) {
        dispatch(
          updatePreferences({
            preferences: { eventSwatches: [...prev, color] },
            userId: user?.uid,
          })
        );
      }
      return [...prev, color];
    });
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "color-popover" : undefined;

  return (
    <Controller
      name="eventSwatch"
      control={control}
      render={({ field }) => {
        return (
          <Box>
            <RadioGroup
              {...field}
              row
              value={value}
              onChange={(e) => onChange(e.target.value)}
              sx={{
                flex: 1,
              }}
            >
              {swatches.map((color, index) => (
                <Radio
                  key={index}
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
                  {optionalColors.map((color, index) => (
                    <Radio
                      key={index}
                      value={color}
                      sx={{
                        padding: 0.25,
                      }}
                      icon={
                        <SquareRoundedIcon
                          sx={{ color: color, fontSize: 32 }}
                        />
                      }
                      checkedIcon={
                        <CheckBoxRoundedIcon
                          sx={{ color: color, fontSize: 32 }}
                        />
                      }
                    />
                  ))}
                </RadioGroup>
              </Box>
            </Popover>
          </Box>
        );
      }}
    />
  );
};

export default ColorPicker;
