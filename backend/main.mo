import Bool "mo:base/Bool";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Int "mo:base/Int";

actor {
    // Stable variables to persist data across upgrades
    stable var storySegments : [Text] = [];
    stable var startTime : Int = 0;
    stable var isStoryActive : Bool = false;

    // Story segment type
    type StorySegment = {
        text: Text;
        timestamp: Int;
    };

    // Buffer to store story segments
    private let segmentBuffer = Buffer.Buffer<Text>(0);

    // Initialize or start a new story
    public func startStory(initialSegment: Text) : async Bool {
        if (isStoryActive) {
            return false;
        };
        
        startTime := Time.now();
        isStoryActive := true;
        segmentBuffer.clear();
        segmentBuffer.add(initialSegment);
        storySegments := segmentBuffer.toArray();
        return true;
    };

    // Add a new segment to the story
    public func addSegment(segment: Text) : async Bool {
        if (not isStoryActive) {
            return false;
        };

        // Check if 24 hours have passed
        let currentTime = Time.now();
        let timeElapsed = currentTime - startTime;
        let twentyFourHours = 24 * 60 * 60 * 1000000000; // in nanoseconds

        if (timeElapsed > twentyFourHours) {
            isStoryActive := false;
            return false;
        };

        segmentBuffer.add(segment);
        storySegments := segmentBuffer.toArray();
        return true;
    };

    // Get all story segments
    public query func getStory() : async {
        segments: [Text];
        isActive: Bool;
        remainingTime: Int;
    } {
        let currentTime = Time.now();
        let timeElapsed = currentTime - startTime;
        let twentyFourHours = 24 * 60 * 60 * 1000000000;
        let remainingTime = if (isStoryActive) {
            Int.max(0, twentyFourHours - timeElapsed)
        } else {
            0
        };

        return {
            segments = storySegments;
            isActive = isStoryActive;
            remainingTime = remainingTime;
        };
    };

    // Reset the story
    public func resetStory() : async () {
        segmentBuffer.clear();
        storySegments := [];
        isStoryActive := false;
        startTime := 0;
    };
}
