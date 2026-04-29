import React, { useRef } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import clsx from "clsx";

// derive the correct ref type dynamically
type SwipeableRefType = InstanceType<typeof Swipeable>;

export interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteText?: string;
  className?: string;
  actionWidth?: number;
}

export default function SwipeableRow({
  children,
  onDelete,
  deleteText = "Delete",
  className,
  actionWidth = 80,
}: SwipeableRowProps) {
  const swipeableRef = useRef<SwipeableRefType | null>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setTimeout(() => onDelete(), 180);
  };

  const renderRightActions = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleDelete}
      className="justify-center items-center"
      style={{ width: actionWidth }}
    >
      <View className="h-full justify-center items-center bg-red-600 px-4">
        <Text className="text-white font-bold">{deleteText}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View className={clsx("bg-white border-b border-gray-200 p-4", className)}>
        {children}
      </View>
    </Swipeable>
  );
}
