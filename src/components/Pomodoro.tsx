import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useSnackbar } from "notistack";

type TimerState = "focus" | "break" | "idle";

const Pomodoro = () => {
  const { enqueueSnackbar } = useSnackbar();
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
    return saved ? Number(saved) : 12;
  });

  const [currentInterval, setCurrentInterval] = useState(() => {
    const saved = localStorage.getItem("pomodoro_state");
    if (saved) {
      const state = JSON.parse(saved);
      return state.currentInterval;
    }
    return 1;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("pomodoro_state");
    if (saved) {
      const state = JSON.parse(saved);
      return state.timeLeft;
    }
    return focusMinutes * 60;
  });

  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem("pomodoro_state");
    if (saved) {
      const state = JSON.parse(saved);
      return state.isActive;
    }
    return false;
  });

  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem("pomodoro_state");
    if (saved) {
      const state = JSON.parse(saved);
      return state.timerState;
    }
    return "idle";
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time: number) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerState === "focus") {
        enqueueSnackbar("Focus session complete! Time for some me time.", {
          anchorOrigin: { vertical: "top", horizontal: "left" },
          autoHideDuration: 10 * 1000, // 10 seconds
        });
        setTimeLeft(breakMinutes * 60);
        setTimerState("break");
      } else if (timerState === "break") {
        if (currentInterval < totalIntervals) {
          enqueueSnackbar("Me time is over! Ready for another focus session?", {
            anchorOrigin: { vertical: "top", horizontal: "left" },
            autoHideDuration: 10 * 1000, // 10 seconds
          });
          setTimeLeft(focusMinutes * 60);
          setTimerState("focus");
          setCurrentInterval((prev: number) => prev + 1);
        } else {
          enqueueSnackbar("Congratulations! You've completed all intervals!", {
            anchorOrigin: { vertical: "top", horizontal: "left" },
            autoHideDuration: 10 * 1000, // 10 seconds
          });
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
    enqueueSnackbar,
  ]);

  useEffect(() => {
    localStorage.setItem(
      "pomodoro_state",
      JSON.stringify({
        timeLeft,
        isActive,
        timerState,
        currentInterval,
        focusMinutes,
        breakMinutes,
        totalIntervals,
      })
    );
  }, [
    timeLeft,
    isActive,
    timerState,
    currentInterval,
    focusMinutes,
    breakMinutes,
    totalIntervals,
  ]);

  useEffect(() => {
    localStorage.setItem("pomodoro_focusMinutes", focusMinutes.toString());
  }, [focusMinutes]);

  useEffect(() => {
    localStorage.setItem("pomodoro_breakMinutes", breakMinutes.toString());
  }, [breakMinutes]);

  useEffect(() => {
    localStorage.setItem("pomodoro_totalIntervals", totalIntervals.toString());
  }, [totalIntervals]);

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
      const value = Math.max(1, Math.min(36, Number(e.target.value)));
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
