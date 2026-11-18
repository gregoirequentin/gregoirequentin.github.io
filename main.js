// ===== Menu mobile =====
const bouton = document.querySelector(".bouton-menu");
const menu = document.querySelector(".menu");
bouton.addEventListener("click", () => {
  const ouvert = menu.classList.toggle("ouvert");
  bouton.setAttribute("aria-expanded", ouvert);
});
menu.querySelectorAll("a").forEach((lien) =>
  lien.addEventListener("click", () => {
    menu.classList.remove("ouvert");
    bouton.setAttribute("aria-expanded", "false");
  })
);

// ===== Lecteurs vidéo / audio intégrés (YouTube, Vimeo, SoundCloud) =====
// Dans le HTML, il suffit d'écrire par exemple :
//   <div class="video" data-youtube="dQw4w9WgXcQ" data-titre="Ma vidéo"></div>
//   <div class="video" data-vimeo="123456789"></div>
//   <div class="video audio" data-soundcloud="https://soundcloud.com/artiste/titre"></div>
document.querySelectorAll(".video").forEach((bloc) => {
  const titre = bloc.dataset.titre || "Contenu multimédia";

  // Message de secours sous chaque lecteur, au cas où la vidéo ou le son ne s'affiche pas
  const note = document.createElement("p");
  note.className = "note-video";
  note.innerHTML = 'Si le lecteur ne s\'affiche pas, <a href="#contact" style="white-space:nowrap">contactez-moi</a>.';
  bloc.insertAdjacentElement("afterend", note);
  let src = "";
  const yt = (bloc.dataset.youtube || "").trim();
  const vm = (bloc.dataset.vimeo || "").trim();
  const sc = (bloc.dataset.soundcloud || "").trim();

  if (yt && !yt.startsWith("VIDEO_ID")) {
    src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(yt);
  } else if (vm && !vm.startsWith("VIDEO_ID")) {
    src = "https://player.vimeo.com/video/" + encodeURIComponent(vm);
  } else if (sc && (sc.startsWith("https://soundcloud.com/") || sc.startsWith("https://on.soundcloud.com/") || sc.startsWith("https://api.soundcloud.com/"))) {
    // Pour un morceau privé, utiliser l'adresse de type api.soundcloud.com/tracks/...?secret_token=... (code « Intégrer » de SoundCloud)
    src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(sc) +
      "&color=%23e76f51&hide_related=true&show_comments=false&show_teaser=false&show_reposts=false";
  }

  if (!src) {
    bloc.classList.add("vide");
    bloc.innerHTML = "<p>▶ Ton contenu s'affichera ici.<br>Remplace <strong>VIDEO_ID</strong> par l'identifiant de ta vidéo dans index.html.</p>";
    return;
  }

  const cadre = document.createElement("iframe");
  cadre.src = src;
  cadre.title = titre;
  cadre.loading = "lazy";
  cadre.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
  cadre.allowFullscreen = true;
  bloc.appendChild(cadre);
});

// ===== Galerie photo : agrandir une image =====
const visionneuse = document.querySelector(".visionneuse");
const grandeImage = visionneuse.querySelector("img");
document.querySelectorAll(".galerie a").forEach((lien) => {
  lien.addEventListener("click", (e) => {
    e.preventDefault();
    grandeImage.src = lien.href;
    grandeImage.alt = lien.querySelector("img").alt;
    visionneuse.classList.add("ouverte");
    visionneuse.querySelector("button").focus();
  });
});
const fermer = () => visionneuse.classList.remove("ouverte");
visionneuse.addEventListener("click", (e) => { if (e.target !== grandeImage) fermer(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(); });

// ===== Surligner la section visible dans le menu =====
const liens = document.querySelectorAll(".menu a");
const sections = [...liens].map((l) => document.querySelector(l.getAttribute("href")));
const observateur = new IntersectionObserver(
  (entrees) => {
    entrees.forEach((en) => {
      if (en.isIntersecting) {
        liens.forEach((l) => l.classList.toggle("actif", l.getAttribute("href") === "#" + en.target.id));
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => s && observateur.observe(s));

// ===== Âge calculé automatiquement (né le 29 octobre 2005) =====
// Il augmente tout seul chaque 29 octobre : rien à modifier.
const aujourdhui = new Date();
let age = aujourdhui.getFullYear() - 2005;
if (aujourdhui < new Date(aujourdhui.getFullYear(), 9, 29)) age -= 1; // 9 = octobre
document.querySelectorAll(".age").forEach((el) => (el.textContent = age));

// ===== Année du pied de page =====
document.getElementById("annee").textContent = new Date().getFullYear();


// ===== Boutons « Copier » (numéro de téléphone, adresse e-mail) =====
document.querySelectorAll("[data-copier]").forEach((bouton) => {
  const texteInitial = bouton.textContent;
  bouton.addEventListener("click", async () => {
    const valeur = bouton.dataset.copier;
    try {
      await navigator.clipboard.writeText(valeur);
    } catch (e) {
      const zone = document.createElement("textarea");
      zone.value = valeur;
      document.body.appendChild(zone);
      zone.select();
      try { document.execCommand("copy"); } catch (e2) {}
      zone.remove();
    }
    bouton.textContent = "Copié";
    setTimeout(() => { bouton.textContent = texteInitial; }, 2000);
  });
});

// ===== Menu « Écrire un e-mail » : Gmail, Outlook, Yahoo (liens assemblés au moment du clic) =====
document.querySelectorAll("[data-webmail]").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    const adresse = encodeURIComponent(bouton.dataset.nom + "@" + bouton.dataset.domaine);
    const sujet = encodeURIComponent("Portfolio");
    const modeles = {
      gmail: "https://" + "mail." + "google" + ".com/mail/?view=cm&fs=1&to=" + adresse + "&su=" + sujet,
      outlook: "https://" + "outlook" + ".live.com/mail/0/deeplink/compose?to=" + adresse + "&subject=" + sujet,
      yahoo: "https://" + "compose.mail" + ".yahoo.com/?to=" + adresse + "&subject=" + sujet,
    };
    window.open(modeles[bouton.dataset.webmail], "_blank", "noopener");
    const menu = bouton.closest("details");
    if (menu) menu.open = false;
  });
});

// ===== Apparition douce des sections (seulement si l'appareil accepte les animations) =====
(function () {
  const accepte = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!accepte || !("IntersectionObserver" in window)) return;
  const cibles = document.querySelectorAll(".bloc-grille > div, .prod, .contact-liste, .contact-mail");
  if (!cibles.length) return;
  document.documentElement.classList.add("anim");
  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); observateur.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
  cibles.forEach((c) => { c.classList.add("apparait"); observateur.observe(c); });
})();
