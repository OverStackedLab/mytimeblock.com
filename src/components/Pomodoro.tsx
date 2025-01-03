import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  IconButton,
  TextField,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNotifications } from "@toolpad/core/useNotifications";

type TimerState = "focus" | "break" | "idle";

const Pomodoro = () => {
  const notifications = useNotifications();
  const [focusMinutes, setFocusMinutes] = useState(() => {
    const saved = localStorage.getItem("pomodoro_focusMinutes");
    return saved ? Number(saved) : 25;
  });
  const [breakMinutes, setBreakMinutes] = useState(() => {
    const saved = localStorage.getItem("pomodoro_breakMinutes");
    return saved ? Number(saved) : 5;
  });
  const [totalIntervals, setTotalIntervals] = useState(() => {
    const saved = localStorage.getItem("pomodoro_totalIntervals");
    return saved ? Number(saved) : 4;
  });
  const [currentInterval, setCurrentInterval] = useState(1);
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>("idle");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerState === "focus") {
        notifications.show("Focus session complete! Time for a break.", {
          autoHideDuration: 8000,
        });
        setTimeLeft(breakMinutes * 60);
        setTimerState("break");
      } else if (timerState === "break") {
        if (currentInterval < totalIntervals) {
          notifications.show(
            "Break time is over! Ready for another focus session?",
            {
              autoHideDuration: 8000,
            }
          );
          setTimeLeft(focusMinutes * 60);
          setTimerState("focus");
          setCurrentInterval((prev) => prev + 1);
        } else {
          notifications.show(
            "Congratulations! You've completed all intervals!",
            {
              autoHideDuration: 8000,
            }
          );
          resetTimer();
        }
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isActive,
    timeLeft,
    timerState,
    breakMinutes,
    focusMinutes,
    currentInterval,
    totalIntervals,
    notifications,
  ]);

  const toggleTimer = () => {
    if (timerState === "idle") {
      setTimerState("focus");
      setTimeLeft(focusMinutes * 60);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimerState("idle");
    setTimeLeft(focusMinutes * 60);
    setCurrentInterval(1);
  };

  const handleFocusMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const value = Math.max(1, Math.min(60, Number(e.target.value)));
      setFocusMinutes(value);
      if (timerState === "focus" || timerState === "idle") {
        setTimeLeft(value * 60);
      }
    } else {
      setFocusMinutes(0);
    }
  };

  const handleBreakMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const value = Math.max(1, Math.min(30, Number(e.target.value)));
      setBreakMinutes(value);
      if (timerState === "break") {
        setTimeLeft(value * 60);
      }
    } else {
      setBreakMinutes(0);
    }
  };

  const handleIntervalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const value = Math.max(1, Math.min(10, Number(e.target.value)));
      setTotalIntervals(value);
    } else {
      setTotalIntervals(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress =
    (timeLeft /
      (timerState === "focus" ? focusMinutes * 60 : breakMinutes * 60)) *
    100;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        pt: 4,
      }}
    >
      <Typography variant="h6">
        {timerState === "focus"
          ? "Focus"
          : timerState === "break"
            ? "Me Time"
            : "Un Pomodoro"}
      </Typography>

      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={100}
          size={180}
          thickness={4}
          sx={{
            color: "grey.200",
            position: "absolute",
          }}
        />
        <CircularProgress
          variant="determinate"
          value={100 - progress}
          size={180}
          thickness={4}
          sx={{
            color: timerState === "break" ? "success.main" : "primary.main",
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" component="div">
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <IconButton onClick={toggleTimer} color="primary" size="large">
          {isActive ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton onClick={resetTimer} color="secondary" size="large">
          <RestartAltIcon />
        </IconButton>
        <Typography color="text.secondary" sx={{ alignSelf: "center" }}>
          {currentInterval}/{totalIntervals}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Focus"
          type="number"
          size="small"
          value={focusMinutes || ""}
          onChange={handleFocusMinutesChange}
          disabled={isActive}
          sx={{ width: 80 }}
        />
        <TextField
          label="Me Time"
          type="number"
          size="small"
          value={breakMinutes || ""}
          onChange={handleBreakMinutesChange}
          disabled={isActive}
          sx={{ width: 80 }}
        />
        <TextField
          label="Intervals"
          type="number"
          size="small"
          value={totalIntervals || ""}
          onChange={handleIntervalsChange}
          disabled={isActive}
          sx={{ width: 80 }}
        />
      </Stack>
    </Box>
  );
};

export default Pomodoro;
