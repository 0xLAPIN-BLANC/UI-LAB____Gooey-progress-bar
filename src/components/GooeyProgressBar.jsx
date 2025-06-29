'use client';
import { useState, useEffect } from 'react';
import { Route, BrainCog, Pencil } from 'lucide-react'

const COLORS = {
    success: '#22C55E',
    inProgress: '#F59E0B',
    neutral: '#E0E0E0',
};

const LAYOUT = {
    radius: 20,
    spacing: 20,
    blur: 6
}

const STEPS = [
    {
        id: 'planning',
        width: 100,
        icon: <Route color='white'/>
    },
    {
        id: 'thinking',
        width: 400,
        icon: <BrainCog color='white'/>
    },
    {
        id: 'writing',
        width: 100,
        icon: <Pencil color='white'/>
    },
]

export default function GooeyProgressBar() {
    const [ fills, setFills ] = useState(() => STEPS.map(() => COLORS.neutral));

    useEffect(() => {
        const flashDuration = 600;
        const flashCount = 5;

        const flashStep = (index) => {
            return new Promise((resolve) => {
                let count = 0;
                let active = false;

                const interval = setInterval(() => {
                    active = !active;
                    setFills((fills) => {
                        const next = [...fills];
                        next[index] = active ? COLORS.inProgress : COLORS.neutral;

                        return next;
                    });

                    if (++count >= flashCount * 2) {
                        clearInterval(interval);
                        setFills((fills) => {
                            const next = [...fills];
                            next[index] = COLORS.success;
                            return next;
                        });

                        resolve()
                    }
                }, flashDuration);
            })
        };

        (async () => {
            setFills((fills) => {
                const next = [...fills];
                next[0] = COLORS.success;
                return next
            })

            for (let i = 1; i<STEPS.length; i++) {
                await flashStep(i);
            }
        })()
    }, []);

    const totalWidth = STEPS.reduce((w, s) => w + s.width, 2 * LAYOUT.radius) + (LAYOUT.spacing * (STEPS.length - 1)) + (2 * LAYOUT.blur);
    const totalHeight = 200 + 2 * LAYOUT.blur

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <svg width={totalWidth} height={totalHeight}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={LAYOUT.blur} result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -6"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>

                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6EE7B7" />
                        <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                </defs>

                <g filter="url(#goo)" transform={`translate(${LAYOUT.blur}, ${LAYOUT.blur})`}>
                    { STEPS.reduce((acc, step, idx) => {
                        const prevX = acc.nextX;

                        const isFirst = idx === 0;
                        const isLast = idx === STEPS.length - 1;
                        const circleCX =
                            isFirst
                            ? LAYOUT.radius
                            : isLast
                                ? prevX + step.width
                                : prevX + step.width/2;
                        const rectX = isFirst ? LAYOUT.radius : prevX;

                        acc.elements.push(
                            <rect
                                key={`rect=${idx}`}
                                x={prevX}
                                y={95}
                                width={step.width}
                                height={10}
                                rx={5}
                                fill={fills[idx]}
                                style={{ transition: 'fill 0.5s ease-in-out' }}
                            />
                        );

                        acc.elements.push(
                            <circle
                                key={`circle-${idx}`}
                                cx={circleCX}
                                cy={100}
                                r={LAYOUT.radius}
                                fill={fills[idx]}
                                style={{ transition: 'fill 0.5s ease-in-out' }}
                            />
                        );

                        acc.elements.push(
                            <g
                                key={`icon-${idx}`}
                                transform={`translate(${circleCX -12}, ${100 -12})`}
                            >
                                {step.icon}
                            </g>
                        )

                       acc.nextX = rectX+ step.width + LAYOUT.spacing;
                        return acc;
                    }, { elements: [], nextX: LAYOUT.radius + LAYOUT.blur }).elements}
                </g>
            </svg>
        </div>
    );
}

function calculateTotalWidth() {
    return STEPS.reduce((w, step) => w + step.width + 40, 0);
}