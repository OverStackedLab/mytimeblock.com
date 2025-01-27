import { useEffect } from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import {
  selectPomodoro,
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  switchMode,
} from "../services/pomodoroSlice";
import { Box, Button, Typography, CircularProgress } from "@mui/material";

const Pomodoro = () => {
  const dispatch = useAppDispatch();
  const { isRunning, timeLeft, mode } = useAppSelector(selectPomodoro);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (timeLeft === 0) {
      dispatch(switchMode());
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, dispatch]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress =
    mode === "focus"
      ? (timeLeft / (25 * 60)) * 100
      : mode === "break"
      ? (timeLeft / (5 * 60)) * 100
      : (timeLeft / (15 * 60)) * 100;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      pt={2}
    >
      <Typography variant="h6" pb={1}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)} Time
      </Typography>
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={progress}
          size={180}
          thickness={4}
        />
        <Box
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          top={0}
          right={0}
          bottom={0}
          left={0}
        >
          <Typography variant="h4">
            {`${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          onClick={() => dispatch(isRunning ? pauseTimer() : startTimer())}
        >
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button variant="outlined" onClick={() => dispatch(resetTimer())}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default Pomodoro;
