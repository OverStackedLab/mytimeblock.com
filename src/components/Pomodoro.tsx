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
  updateSettings,
  resetSettings,
} from "../services/pomodoroSlice";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const Pomodoro = () => {
  const dispatch = useAppDispatch();
  const {
    isRunning,
    timeLeft,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    completedSessions,
    totalIntervals,
  } = useAppSelector(selectPomodoro);

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
      ? (timeLeft / workDuration) * 100
      : mode === "break"
      ? (timeLeft / breakDuration) * 100
      : (timeLeft / longBreakDuration) * 100;

  const handleFocusMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ workDuration: value * 60 }));
    }
  };

  const handleBreakMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ breakDuration: value * 60 }));
    }
  };

  const handleLongBreakMinutesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ longBreakDuration: value * 60 }));
    } else {
      dispatch(updateSettings({ longBreakDuration: 0 }));
    }
  };

  const handleIntervalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ sessionsBeforeLongBreak: value }));
    }
  };

  const handleTotalIntervalsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ totalIntervals: value }));
    }
  };

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
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <IconButton
          onClick={() => dispatch(isRunning ? pauseTimer() : startTimer())}
          color="primary"
          size="large"
        >
          {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton
          onClick={() => dispatch(resetTimer())}
          color="secondary"
          size="large"
        >
          <RestartAltIcon />
        </IconButton>
        <Typography color="text.secondary" sx={{ alignSelf: "center" }}>
          {completedSessions}/{totalIntervals}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2, px: 3 }}>
        <TextField
          label="Focus"
          type="number"
          size="small"
          value={workDuration / 60 || ""}
          onChange={handleFocusMinutesChange}
          disabled={isRunning}
          sx={{ width: 80 }}
        />
        <TextField
          label="Me Time"
          type="number"
          size="small"
          value={breakDuration / 60 || ""}
          onChange={handleBreakMinutesChange}
          disabled={isRunning}
          sx={{ width: 80 }}
        />
        <TextField
          label="Intervals"
          type="number"
          size="small"
          value={totalIntervals || ""}
          onChange={handleTotalIntervalsChange}
          disabled={isRunning}
          sx={{ width: 90 }}
        />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2, width: "100%", px: 3 }}>
        <TextField
          label="Break After"
          type="number"
          size="small"
          value={sessionsBeforeLongBreak || ""}
          onChange={handleIntervalsChange}
          disabled={isRunning}
          sx={{ width: 80 }}
        />
        <TextField
          label="Long Break"
          type="number"
          size="small"
          value={longBreakDuration / 60 || ""}
          onChange={handleLongBreakMinutesChange}
          disabled={isRunning}
          sx={{ width: 90 }}
        />

        <Button
          variant="contained"
          onClick={() => dispatch(resetSettings())}
          size="small"
          disabled={isRunning}
          sx={{ color: "white" }}
        >
          Default
        </Button>
      </Stack>
    </Box>
  );
};

export default Pomodoro;
