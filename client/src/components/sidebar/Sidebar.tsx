import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { IoCodeSlash, IoVideocam } from "react-icons/io5"  // <-- Added IoVideocam for video call
import { MdOutlineDraw } from "react-icons/md"
import cn from "classnames"
import { Tooltip } from 'react-tooltip'
import { useState, useEffect } from 'react'
import { tooltipStyles } from "./tooltipStyles"

// === Begin: Video Call Functionality (Stream Video SDK) ===
import { 
  CallingState, 
  StreamCall, 
  ParticipantView, 
  StreamVideoParticipant, 
  StreamVideo, 
  StreamVideoClient, 
  useCallStateHooks, 
  User, 
  StreamTheme, 
  CallControls,
  SpeakerLayout
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';


// --- Constants & Client Setup ---
const apiKey = 'mmhfdzb5evj2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0phY2VuX1NvbG8iLCJ1c2VyX2lkIjoiSmFjZW5fU29sbyIsInZhbGlkaXR5X2luX3NlY29uZHMiOjYwNDgwMCwiaWF0IjoxNzM5Nzg1NTY2LCJleHAiOjE3NDAzOTAzNjZ9.z2X7e-ndvKE7YzoZEX3Os83Sgk-SK2SHwakdoEeMK8o';
const userId = 'Jacen_Solo';
const callId = 'm010nnyq0GLE';

const user: User = {
  id: userId,
  name: 'Arshi',
  image: 'https://getstream.io/random_svg/?id=Arshi&name=Arshi',
};

const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call('default', callId);

// --- Video Call View Component ---
function VideoCallView() {
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const joinCall = async () => {
      try {
        await call.join({ create: true });
        setIsJoined(true);
      } catch (error) {
        console.error('Error joining call:', error);
      }
    };
    joinCall();
  }, []);

  if (!isJoined) {
    return <div>Connecting to call...</div>;
  }

  return (
    <StreamTheme>
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout />
        </StreamCall>
      </StreamVideo>
    </StreamTheme>
  );
}

// --- UI Layout for the Call ---
export const MyUILayout = () => {
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();
  // participantCount could be used if needed

  if (callingState !== CallingState.JOINED) {
    return <div>video call ended...</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};

// --- (Optional) Additional Components ---
export const MyParticipantsList = ({ participants }: { participants: StreamVideoParticipant[] }) => {
  if (!participants || participants.length === 0) {
    return <div>No participants available</div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100vw' }}>
      {participants.map((participant) => (
        <div key={participant.sessionId} style={{ width: '200px', aspectRatio: '3/2' }}>
          <ParticipantView muteAudio participant={participant} />
        </div>
      ))}
    </div>
  );
};

export const MyFloatingLocalParticipant = ({ participant }: { participant?: StreamVideoParticipant }) => {
  if (!participant) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '15px',
      left: '15px',
      width: '240px',
      height: '135px',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 10px 3px',
      borderRadius: '12px',
      backgroundColor: 'white'
    }}>
      <ParticipantView muteAudio participant={participant} />
    </div>
  );
};
// === End: Video Call Functionality ===

// === Sidebar Component (Merged) ===
function Sidebar() {
  const {
    activeView,
    isSidebarOpen,
    viewComponents,
    viewIcons,
    setIsSidebarOpen,
  } = useViews();
  const { minHeightReached } = useResponsive();
  const { activityState, setActivityState } = useAppContext();
  const { socket } = useSocket();
  const { isMobile } = useWindowDimensions();
  const [showTooltip, setShowTooltip] = useState(true);

  const changeState = () => {
    setShowTooltip(false);
    if (activityState === ACTIVITY_STATE.CODING) {
      setActivityState(ACTIVITY_STATE.DRAWING);
      socket.emit(SocketEvent.REQUEST_DRAWING);
    } else {
      setActivityState(ACTIVITY_STATE.CODING);
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Extend the viewComponents mapping to include the Video Call view.
  // Ensure that your VIEWS constant has a VIDEO_CALL property.
  const extendedViewComponents = {
    ...viewComponents,
    [VIEWS.VIDEO_CALL]: <VideoCallView />,
  };

  return (
    <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
      <div
        className={cn(
          "fixed bottom-0 left-0 z-50 flex h-[50px] w-full gap-4 self-end overflow-hidden border-t border-darkHover bg-dark p-2 md:static md:h-full md:w-[50px] md:min-w-[50px] md:flex-col md:border-r md:border-t-0 md:p-2 md:pt-4",
          { hidden: minHeightReached },
        )}
      >
        <SidebarButton viewName={VIEWS.FILES} icon={viewIcons[VIEWS.FILES]} />
        <SidebarButton viewName={VIEWS.CHATS} icon={viewIcons[VIEWS.CHATS]} />
        <SidebarButton viewName={VIEWS.RUN} icon={viewIcons[VIEWS.RUN]} />
        <SidebarButton viewName={VIEWS.CLIENTS} icon={viewIcons[VIEWS.CLIENTS]} />
        <SidebarButton viewName={VIEWS.SETTINGS} icon={viewIcons[VIEWS.SETTINGS]} />
        {/* New Sidebar Button for Group Video Call */}
        <SidebarButton viewName={VIEWS.VIDEO_CALL} icon={<IoVideocam size={30} />} />

        {/* Button to change activity state (coding/drawing) */}
        <div className="flex items-center justify-center h-fit">
          <button
            className="flex items-center justify-center rounded transition-colors duration-200 ease-in-out hover:bg-[#3D404A] p-1.5"
            onClick={changeState}
            onMouseEnter={() => setShowTooltip(true)}
            data-tooltip-id="activity-state-tooltip"
            data-tooltip-content={
              activityState === ACTIVITY_STATE.CODING
                ? "Switch to Drawing Mode"
                : "Switch to Coding Mode"
            }
          >
            {activityState === ACTIVITY_STATE.CODING ? (
              <MdOutlineDraw size={30} />
            ) : (
              <IoCodeSlash size={30} />
            )}
          </button>
          {showTooltip && (
            <Tooltip
              id="activity-state-tooltip"
              place="right"
              offset={15}
              className="!z-50"
              style={tooltipStyles}
              noArrow={false}
              positionStrategy="fixed"
              float={true}
            />
          )}
        </div>
      </div>
      <div
        className="absolute left-0 top-0 z-20 w-full flex-col bg-dark md:static md:min-w-[300px]"
        style={isSidebarOpen ? {} : { display: "none" }}
      >
        {/* Render the active view component (extended to include the Video Call view) */}
        {extendedViewComponents[activeView]}
      </div>
    </aside>
  );
}

export default Sidebar;
