import React, {useEffect, useState} from 'react';
import styles from './landing.css';
import blockflowLogo from '../components/menu-bar/blockflow-logo.svg';

const FEATURES = [
    {
        emoji: '📦',
        title: 'Project Files',
        description: 'Configure the editor UI, blocks, and assets with a single JSON file.'
    },
    {
        emoji: '📖',
        title: 'Tutorials',
        description: 'Embed step-by-step instructions with text, images, and videos.'
    },
    {
        emoji: '🧩',
        title: 'Toolbox Filtering',
        description: 'Restrict the block palette to specific categories or individual blocks.'
    },
    {
        emoji: '▶️',
        title: 'Player Mode',
        description: 'A dedicated full-screen playback mode that hides the editor.'
    }
];

const LandingApp = () => {
    const [examples, setExamples] = useState([]);

    useEffect(() => {
        fetch('/static/examples.json')
            .then(res => res.json())
            .then(setExamples)
            .catch(() => setExamples([]));
    }, []);

    const editorUrl = example => {
        const projectParam = encodeURIComponent(example.projectUrl);
        return `editor.html?project=${projectParam}`;
    };

    return (
        <div className={styles.landing}>
            <header className={styles.header}>
                <img
                    alt="Blockflow"
                    className={styles.headerLogo}
                    src={blockflowLogo}
                />
                <div className={styles.headerLinks}>
                    <a
                        className={styles.headerLink}
                        href="editor.html"
                    >
                        {'Editor'}
                    </a>
                    <a
                        className={styles.headerLink}
                        href="generator.html"
                    >
                        {'Generator'}
                    </a>
                </div>
            </header>

            <section className={styles.hero}>
                <h1>{'Blockflow'}</h1>
                <p>
                    {'A customizable Scratch editor for education. Configure blocks, embed tutorials, and create guided coding experiences — all from a single project file.'}
                </p>
                <div className={styles.heroButtons}>
                    <a
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        href="editor.html"
                    >
                        {'Open Editor'}
                    </a>
                    <a
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        href="generator.html"
                    >
                        {'Project Generator'}
                    </a>
                </div>
            </section>

            <section className={styles.features}>
                <h2>{'Features'}</h2>
                <div className={styles.featuresGrid}>
                    {FEATURES.map(feature => (
                        <div
                            className={styles.featureCard}
                            key={feature.title}
                        >
                            <div className={styles.emoji}>{feature.emoji}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {examples.length > 0 && (
                <section className={styles.examples}>
                    <h2>{'Examples'}</h2>
                    <div className={styles.examplesGrid}>
                        {examples.map(example => (
                            <a
                                className={styles.exampleCard}
                                href={editorUrl(example)}
                                key={example.title}
                            >
                                <div className={styles.exampleCardImage}>
                                    <img
                                        alt={example.title}
                                        src={example.image}
                                    />
                                </div>
                                <div className={styles.exampleCardBody}>
                                    <h3>{example.title}</h3>
                                    <p>{example.description}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            <section className={styles.usage}>
                <h2>{'Usage'}</h2>

                <h3>{'The project parameter'}</h3>
                <p>
                    {'Both the editor and the player accept a '}
                    <code>{'?project='}</code>
                    {' URL parameter. It can be:'}
                </p>
                <ul>
                    <li>{'A URL to a .json project file'}</li>
                    <li>{'A URL to an .sb3 Scratch project'}</li>
                    <li>{'A pako-compressed JSON string (prefixed with pako:)'}</li>
                </ul>
                <p>{'For example, to load a project file hosted on your server:'}</p>
                <pre className={styles.codeBlock}>
                    {'https://blockflow.openpatch.org/editor.html?project=https://example.com/my-project.json'}
                </pre>

                <h3>{'Embedding the editor in an iframe'}</h3>
                <p>
                    {'You can embed the Blockflow editor into any webpage using an iframe. Pass the project configuration via the '}
                    <code>{'?project='}</code>
                    {' parameter:'}
                </p>
                <pre className={styles.codeBlock}>
                    {'<iframe\n  src="https://blockflow.openpatch.org/editor.html?project=https://example.com/my-project.json"\n  width="960"\n  height="640"\n  frameborder="0"\n  allowfullscreen\n></iframe>'}
                </pre>

                <h3>{'Embedding the player in an iframe'}</h3>
                <p>
                    {'The player mode provides a minimal, full-screen playback view without the editor UI — ideal for showcasing finished projects:'}
                </p>
                <pre className={styles.codeBlock}>
                    {'<iframe\n  src="https://blockflow.openpatch.org/player.html?project=https://example.com/my-project.json"\n  width="480"\n  height="360"\n  frameborder="0"\n  allowfullscreen\n></iframe>'}
                </pre>

                <h3>{'Creating a project file'}</h3>
                <p>
                    {'Use the '}
                    <a href="generator.html">{'Project Generator'}</a>
                    {' to visually configure your project — select block categories, add tutorial steps, and export the configuration as a JSON file or a shareable URL.'}
                </p>

                <h3>{'External asset libraries'}</h3>
                <p>
                    {'Costumes, sounds, backdrops, and sprites can reference external libraries by providing a URL string, or a mixed array of URLs and inline objects:'}
                </p>
                <pre className={styles.codeBlock}>
                    {'{\n  "costumes": {\n    "library": [\n      "https://example.com/costumes-set-a.json",\n      { "name": "custom", "url": "https://example.com/custom.svg", "centerX": 32, "centerY": 32 },\n      "https://example.com/costumes-set-b.json"\n    ]\n  }\n}'}
                </pre>
                <p>
                    {'The external JSON file should contain an array of asset objects. Relative URLs inside the file are resolved against the library URL:'}
                </p>
                <pre className={styles.codeBlock}>
                    {'[\n  {\n    "name": "fish",\n    "url": "assets/fish.svg",\n    "centerX": 32,\n    "centerY": 32\n  }\n]'}
                </pre>
            </section>

            <footer className={styles.footer}>
                <p>
                    {'Built with ❤️ by '}
                    <a href="https://openpatch.org">{'OpenPatch'}</a>
                    {' · '}
                    <a href="https://github.com/openpatch/blockflow">{'GitHub'}</a>
                </p>
            </footer>
        </div>
    );
};

export default LandingApp;
