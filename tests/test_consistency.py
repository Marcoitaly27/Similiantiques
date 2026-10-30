"""Exercise the real report-verification CLI; no torch/model or network needed."""
import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "consistency.py"


def verify(tmp_path, samples):
    report = tmp_path / "browser-report.json"
    report.write_text(json.dumps({"samples": samples}))
    return subprocess.run(
        [sys.executable, str(SCRIPT), "verify", str(report)],
        capture_output=True, text=True, check=False,
    )


def test_accepts_five_strictly_above_threshold(tmp_path):
    result = verify(tmp_path, [{"cosine": score} for score in [0.981, 0.99, 1, 0.995, 0.999]])
    assert result.returncode == 0
    assert "PASS: 5/5" in result.stdout


@pytest.mark.parametrize("score", [0.98, 0.9799, -1, 1.1, None, "0.99", float("nan"), float("inf")])
def test_one_invalid_sample_rejects_whole_run(tmp_path, score):
    samples = [{"cosine": 0.999} for _ in range(4)] + [{"cosine": score}]
    result = verify(tmp_path, samples)
    assert result.returncode != 0
    assert "FAIL" in result.stderr


@pytest.mark.parametrize("count", [0, 1, 4, 6])
def test_requires_exactly_five_samples(tmp_path, count):
    result = verify(tmp_path, [{"cosine": 0.99} for _ in range(count)])
    assert result.returncode != 0
    assert "FAIL" in result.stderr


def test_missing_cosine_is_rejected(tmp_path):
    result = verify(tmp_path, [{} for _ in range(5)])
    assert result.returncode != 0


def test_claimed_pass_does_not_override_failed_measurement(tmp_path):
    samples = [{"cosine": 0.5, "passed": True} for _ in range(5)]
    result = verify(tmp_path, samples)
    assert result.returncode != 0
