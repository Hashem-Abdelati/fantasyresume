import type { ReactNode } from "react";
export type InventoryItem = {
  id: string;
  name: string;
  icon: "book" | "mountain" | "film" | "briefcase";
  rarity: "legendary" | "epic" | "rare";
  summary: string;
  content: ReactNode;
};

export const inventoryItems: InventoryItem[] = [
  {
    id: "my-life",
    name: "More About Me",
    icon: "book",
    rarity: "legendary",
    summary: "Diary entry • roots • personality",
    content: (
      <div className="inv-diary">
        <p>
          Hi there! I’m Hashem. I was born on the 16th of January 2004, and I’m
          going to tell you a bit about myself.
        </p>

        <p>
          First things first, speed facts: I’m a twin (me, my twin, and my
          little sister circa 2012), I’m from Amman, Jordan, and I love history
          and how it shaped the world we live in. Things that feel bigger than
          reality have always drawn me in.
        </p>

        <p>
          Family is a huge part of who I am. I’m very close with mine, and a lot
          of my values come from that connection. Food is part of that too, I
          love Arabic food, and if I had to choose a favorite, it would probably
          be mujadara (a rice and lentil dish). Simple, comforting, and
          impossible to get tired of when it’s done right.
        </p>

        <p>
          I’m currently reading <em>A Song of Ice and Fire</em> and I’m on{" "}
          <em>A Clash of Kings</em>. I love stories with layered characters,
          political tension, and moral ambiguity, the kind that trust the reader
          to think and sit with complexity.
        </p>

        <p>
          I enjoy staying active. I go to the gym regularly, and I’ve always
          loved horseback riding, it’s one of the few activities that manages to
          be both calming and intense at the same time. Archery is next on my
          list; the mix of focus, patience, and precision really appeals to me.
        </p>

        <p>
          At the end of the day, I’m someone who enjoys learning, creating, and
          improving. Whether it’s through code, stories, or new experiences, I
          like depth, I value connection, and I’m always curious about what I
          can build next.
        </p>
        <p>Continue exploring the inventory to learn more.</p>
        <p> - Hashem Abdelati 08/02/2026 </p>

        <div className="inv-subtitle">Family Snapshot</div>
        <figure className="artifact-figure">
          <div className="artifact-image-wrap">
            <img
              src="/inventory/web/siblings.webp"
              alt="Me, my twin, and my little sister circa 2012"
              className="artifact-image"
            />
          </div>
          <figcaption>Me, my twin, and my little sister circa 2012</figcaption>
        </figure>
      </div>
    ),
  },
  {
    id: "career-goals",
    name: "Career Goals",
    icon: "briefcase",
    rarity: "legendary",
    summary: "Software engineering • AI • product building",
    content: (
      <div className="inv-diary">
        <p>
          Professionally, I’m interested in roles where I can combine
          engineering, data, product thinking, and real-world impact. The main
          paths I’m exploring are software engineering, data engineering,
          technical consulting, software consulting, data science, cloud
          architecture, and solutions architecture.
        </p>

        <p>
          I like work that sits at the intersection of building and
          problem-solving. On one side, I enjoy creating full-stack
          applications, designing clean systems, and turning ideas into usable
          products. On the other side, I’m drawn to data, machine learning, and
          AI because they allow technology to become more adaptive,
          personalized, and intelligent.
        </p>

        <p>
          Some of the areas I’m most excited about are bioinformatics, wearable
          technology, AI agents, health-focused software, and data-driven
          platforms. I’m especially interested in how AI can be used to make a
          practical impact, whether that means helping people make better
          decisions, improving health outcomes, automating complicated
          workflows, or making complex information easier to understand.
        </p>

        <p>
          Long term, I want to become the kind of technical professional who can
          move between engineering depth and strategic thinking. I want to
          understand the architecture, the data, the user, and the business
          problem well enough to build solutions that are not only impressive,
          but genuinely useful.
        </p>

        <p>
          I’m still early in my career, but I know the direction I want to move
          in: keep building, keep learning, and keep working on technology that
          has a reason to exist beyond the screen.
        </p>

        <p> - Hashem Abdelati 02/05/2026 </p>
      </div>
    ),
  },
  {
    id: "touching-grass",
    name: "Touching Grass",
    icon: "mountain",
    rarity: "epic",
    summary: "Outdoor adventures • mountains • desert",
    content: (
      <div className="inv-diary">
        <p>
          There’s nothing quite like the great outdoors (even though, as a CS
          major, I rarely get to see it). I love disconnecting, slowing down,
          and getting away from noise.
        </p>

        <p>
          I’ve been lucky enough to visit places that really left an impression
          on me. Yosemite felt unreal, massive granite cliffs, quiet trails, and
          a sense of scale that makes you feel small in the best way. Costa Rica
          is probably my favorite place I’ve ever been; the mix of rainforest,
          wildlife, and ocean made everything feel alive and effortless, it was
          peace and adventure, I also tried surfing which was so fun. Wadi Rum
          was something else entirely. I'm proud to call Jordan home and this
          amazing endless pink desert, that should be talked about more, was a
          reminder of the beauty and history right in my backyard.
        </p>

        <p>
          Whether it’s hiking through mountains, exploring jungles, or trekking
          through the desert, I’m always ready for clean air and a mental reset.
          Being outside helps me think more clearly, stay present, and come back
          to my work with a better headspace.
        </p>
        <p> - Hashem Abdelati 08/02/2026 </p>

        <div className="inv-subtitle">My Adventures</div>
        <div className="inv-image-grid inv-image-grid--fit">
          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/mecamping.webp"
                alt="Me in Wadi Rum"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Me in Wadi Rum</figcaption>
          </figure>

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/meonmountin.webp"
                alt="Hiking to the peak"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Hiking to the peak</figcaption>
          </figure>

          {/* <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/web/sunset.webp"
                    alt="Desert sunset views"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Desert sunset views</figcaption>
                </figure> */}

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/yosemite.webp"
                alt="Exploring Yosemite"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Exploring Yosemite</figcaption>
          </figure>

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/yosemite2.webp"
                alt="Another breathtaking Yosemite view"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Another breathtaking Yosemite view</figcaption>
          </figure>
          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/costabeachsun.webp"
                alt="Sunset at a beach in Costa Rica"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Sunset at a beach in Costa Rica</figcaption>
          </figure>

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/volcanoincosta.webp"
                alt="Volcano landscape in Costa Rica"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Arenal Volcano, Costa Rica.</figcaption>
          </figure>
        </div>
      </div>
    ),
  },
  {
    id: "watching-movies",
    name: "Watching Movies",
    icon: "film",
    rarity: "rare",
    summary: "Poster photos • favorites • Letterboxd diary",
    content: (
      <div className="inv-diary">
        <p>
          I’m that friend who takes photos in front of movie posters and logs
          everything I watch on Letterboxd. Movies are one of the ways I slow
          down and think about stories, characters, and the world. I love how
          they can transport you to different places, times, and perspectives,
          and how they can make you feel deeply in just a couple of hours. Plus
          theyre a good way to relax!
        </p>

        <p>
          Some of my favorite movies stay with me because of how personal or
          intentional they feel. <em>Sinners</em> was just wow, it stood out to
          me because it was honest and wasnt afraid to write something insane,
          and how it trusted the audience without overexplaining itself.{" "}
          <em>The Social Network</em> is one of those movies I can rewatch
          forever. I know what you're thinking youre a CS major of course the
          social network is up there, but it's sharp dialogue, quiet tension,
          music and plot about ambition that makes it great and feels just as
          relevant now as when it came out, it's a lesson for people in the
          industry.
        </p>

        <p>
          <em>Palestine 36</em> means something different to me. It’s not an
          easy watch whatsoever, but it’s an important one. Its grounded in
          history, memory, and perspective. It’s the kind of film that reminds
          me why cinema matters beyond entertainment and how movies can send a
          message. On the other end of the spectrum, <em>Avengers: Endgame</em>{" "}
          represents everything great about shared movie experiences, years of
          buildup, emotional payoff, and the kind of moment you remember
          watching with other people for the rest of your life.
        </p>

        <p>
          I’m drawn to movies that earn their impact, whether that’s through
          character, history, or long-term storytelling. I like films that give
          me something to sit with afterward, and Letterboxd has become my way
          of keeping track of those moments (scroll down to find me on letter
          box).
        </p>
        <p> - Hashem Abdelati 08/02/2026 </p>

        <div className="inv-subtitle">Posters + Recent Watches</div>
        <div className="inv-image-grid inv-image-grid--fit">
          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/Sinners.webp"
                alt="Sinners"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>
              Me in front of Sinners Poster (One of my favs)
            </figcaption>
          </figure>

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/superman.webp"
                alt="Superman"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Me in front of Superman Poster</figcaption>
          </figure>

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/httyd.webp"
                alt="How to Train Your Dragon"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>
              Me in front of How to Train Your Dragon Poster
            </figcaption>
          </figure>

          <figure className="inv-figure inv-figure--fit">
            <div className="inv-img-wrap">
              <img
                src="/inventory/web/missionimpossible.webp"
                alt="Mission Impossible"
                className="inv-img inv-img--fit"
                loading="lazy"
              />
            </div>
            <figcaption>Me in front of Mission Impossible Poster</figcaption>
          </figure>
        </div>

        <p className="mt-3">
          Give me a follow on{" "}
          <a
            href="https://letterboxd.com/hashem_abdelati/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Letterboxd
          </a>{" "}
          if you want to see amazing reviews.
        </p>

        <iframe
          title="Hashem’s Letterboxd diary"
          className="letterboxd-embed"
          src="https://lb-embed-content.bokonon.dev?username=hashem_abdelati"
          sandbox=""
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    ),
  },
];
