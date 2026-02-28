import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

const HelpTour = ({ steps, run, setRun }) => {
    const handleJoyrideCallback = (data) => {
        const { status, type } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            // Close the tour if the user finishes or clicks 'skip'
            setRun(false);
        }

        // Console logging for debugging step progression if needed
        // console.log(`Joyride: type=${type}, status=${status}`);
    };

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous={true}
            run={run}
            scrollToFirstStep={true}
            showProgress={true}
            showSkipButton={true}
            steps={steps}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#2563eb', // Matches TFA var(--primary) blue
                    textColor: '#1f2937',    // Dark gray text
                    backgroundColor: '#ffffff',
                    arrowColor: '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.65)',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#2563eb',
                    borderRadius: '6px',
                    fontWeight: 600,
                },
                buttonBack: {
                    marginRight: 10,
                    color: '#4b5563', // gray-600
                },
                buttonSkip: {
                    color: '#6b7280', // gray-500
                    fontWeight: 500,
                }
            }}
            locale={{
                last: 'Finish Tour',
                skip: 'Skip Tour'
            }}
        />
    );
};

export default HelpTour;
