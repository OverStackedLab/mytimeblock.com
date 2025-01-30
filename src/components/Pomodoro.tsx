import { useEffect } from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSlector";
import { useSnackbar } from "notistack";
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
  const { enqueueSnackbar } = useSnackbar();
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
    if (isRunning && timeLeft && timeLeft > 0) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Show different messages based on completed mode
      if (mode === "focus") {
        enqueueSnackbar("Focus time complete! Time for a break.", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      } else if (mode === "break" || mode === "longBreak") {
        enqueueSnackbar("Break time over! Let's focus again.", {
          variant: "info",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      }

      // Play notification sound
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {
        enqueueSnackbar("Audio playback blocked", {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      });

      dispatch(switchMode());
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, dispatch, mode, enqueueSnackbar]);

  const minutes = timeLeft ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft ? timeLeft % 60 : 0;

  const progress =
    100 -
    (mode === "focus"
      ? timeLeft && workDuration
        ? (timeLeft / workDuration) * 100
        : 0
      : mode === "break"
      ? timeLeft && breakDuration
        ? (timeLeft / breakDuration) * 100
        : 0
      : timeLeft && longBreakDuration
      ? (timeLeft / longBreakDuration) * 100
      : 0);

  const handleFocusMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ workDuration: value * 60 }));
    } else {
      dispatch(updateSettings({ workDuration: 0 }));
    }
  };

  const handleBreakMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ breakDuration: value * 60 }));
    } else {
      dispatch(updateSettings({ breakDuration: 0 }));
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
    } else {
      dispatch(updateSettings({ sessionsBeforeLongBreak: 0 }));
    }
  };

  const handleTotalIntervalsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ totalIntervals: value }));
    } else {
      dispatch(updateSettings({ totalIntervals: 0 }));
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
          disabled={
            workDuration === 0 ||
            breakDuration === 0 ||
            totalIntervals === 0 ||
            sessionsBeforeLongBreak === 0 ||
            longBreakDuration === 0
          }
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
          error={workDuration === 0}
          label="Focus"
          type="number"
          size="small"
          required
          value={workDuration === 0 ? "" : workDuration / 60}
          onChange={handleFocusMinutesChange}
          disabled={isRunning}
          sx={{ width: 80 }}
        />
        <TextField
          error={breakDuration === 0}
          label="Me Time"
          type="number"
          size="small"
          required
          value={breakDuration === 0 ? "" : breakDuration / 60}
          onChange={handleBreakMinutesChange}
          disabled={isRunning}
          sx={{ width: 80 }}
        />
        <TextField
          error={totalIntervals === 0}
          label="Intervals"
          type="number"
          size="small"
          required
          value={totalIntervals === 0 ? "" : totalIntervals}
          onChange={handleTotalIntervalsChange}
          disabled={isRunning}
          sx={{ width: 90 }}
        />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2, width: "100%", px: 3 }}>
        <TextField
          error={sessionsBeforeLongBreak === 0}
          label="Break After"
          type="number"
          size="small"
          required
          value={sessionsBeforeLongBreak === 0 ? "" : sessionsBeforeLongBreak}
          onChange={handleIntervalsChange}
          disabled={isRunning}
          sx={{ width: 80 }}
        />
        <TextField
          error={longBreakDuration === 0}
          label="Long Break"
          type="number"
          size="small"
          required
          value={longBreakDuration === 0 ? "" : longBreakDuration / 60}
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
