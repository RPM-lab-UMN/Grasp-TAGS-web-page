(() => {
  "use strict";

  const videoDirectory = "media/results/synthetic_data/videos";
  const catalog = {
    "bucket-1": {
      label: "Bucket 1",
      fixedGraspCount: 2,
      poses: { "01": [0, 0], "02": [1, 0], "03": [0, 0], "04": [1, 1] },
    },
    "bucket-2": {
      label: "Bucket 2",
      fixedGraspCount: 2,
      poses: { "01": [1, 0], "02": [1, 0], "03": [1, 0], "04": [1, 1] },
    },
    "bucket-3": {
      label: "Bucket 3",
      fixedGraspCount: 2,
      poses: { "01": [0, 0], "02": [0, 0], "03": [0, 0], "04": [0, 1] },
    },
    "cart-1": {
      label: "Cart 1",
      fixedGraspCount: 3,
      poses: { "01": [1, 0], "02": [2, 2], "03": [2, 1], "04": [2, 0] },
    },
    "cart-2": {
      label: "Cart 2",
      fixedGraspCount: 3,
      poses: { "01": [0, 0], "02": [0, 2], "03": [1, 1], "04": [2, 0] },
    },
    "chair-1": {
      label: "Chair 1",
      fixedGraspCount: 3,
      poses: { "01": [2, 0], "02": [0, 2], "03": [0, 1], "04": [2, 0] },
    },
    "chair-2": {
      label: "Chair 2",
      fixedGraspCount: 3,
      poses: { "01": [2, 0], "02": [0, 2], "03": [2, 1], "04": [2, 0] },
    },
    "chair-3": {
      label: "Chair 3",
      fixedGraspCount: 3,
      poses: { "01": [2, 0], "02": [2, 2], "03": [2, 1], "04": [2, 0] },
    },
  };

  const state = { object: "chair-1", targetSet: "01" };

  function videoPath(object, targetSet, rollout, method, pose) {
    return `${videoDirectory}/target-set-${targetSet}-${object}-rollout-${rollout}-${method}-pose-${pose}.mp4`;
  }

  function methodCards(object, targetSet) {
    const item = catalog[object];
    const [rankedPose, randomPose] = item.poses[targetSet];
    const cards = [
      {
        label: "Grasp-TAGS (Ours)",
        pose: rankedPose,
        source: videoPath(object, targetSet, "00", "grasp_ranking-ranked", rankedPose),
      },
      {
        label: "PPO_g + Random",
        pose: randomPose,
        source: videoPath(object, targetSet, "01", "grasp_ranking-random", randomPose),
      },
    ];

    for (let pose = 0; pose < item.fixedGraspCount; pose += 1) {
      cards.push({
        label: `PPO_i (g${pose + 1})`,
        pose,
        source: videoPath(object, targetSet, String(pose + 2).padStart(2, "0"), `ppo${pose}-fixed`, pose),
      });
    }

    return cards;
  }

  function setButtonState(selector, attribute, value) {
    document.querySelectorAll(selector).forEach((button) => {
      const selected = button.dataset[attribute] === value;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function createVideoCard(card) {
    const figure = document.createElement("figure");
    figure.className = "qualitative-video-card";

    const title = document.createElement("figcaption");
    title.className = "qualitative-video-card-title";
    title.textContent = card.label;
    figure.append(title);

    const video = document.createElement("video");
    video.autoplay = true;
    video.controls = true;
    video.defaultMuted = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-label", `${card.label}, selected grasp g${card.pose + 1}`);

    const source = document.createElement("source");
    source.src = card.source;
    source.type = "video/mp4";
    video.append(source);
    figure.append(video);

    const pose = document.createElement("p");
    pose.className = "qualitative-video-card-meta";
    pose.textContent = `Executed grasp: g${card.pose + 1}`;
    figure.append(pose);

    return figure;
  }

  function renderVideoRow() {
    const grid = document.getElementById("qualitative-video-grid");
    const selection = document.getElementById("qualitative-video-selection");
    const item = catalog[state.object];
    const cards = methodCards(state.object, state.targetSet);

    grid.replaceChildren(...cards.map(createVideoCard));
    grid.style.setProperty("--video-columns", String(Math.min(cards.length, 3)));
    selection.textContent = `Showing ${item.label}, Target Object Pose ${Number(state.targetSet)}.`;
  }

  function initializeQualitativeVideos() {
    const grid = document.getElementById("qualitative-video-grid");
    if (!grid) {
      return;
    }

    document.querySelectorAll("[data-video-object]").forEach((button) => {
      button.addEventListener("click", () => {
        state.object = button.dataset.videoObject;
        setButtonState("[data-video-object]", "videoObject", state.object);
        renderVideoRow();
      });
    });

    document.querySelectorAll("[data-video-target-set]").forEach((button) => {
      button.addEventListener("click", () => {
        state.targetSet = button.dataset.videoTargetSet;
        setButtonState("[data-video-target-set]", "videoTargetSet", state.targetSet);
        renderVideoRow();
      });
    });

    renderVideoRow();
  }

  document.addEventListener("DOMContentLoaded", initializeQualitativeVideos);
})();
