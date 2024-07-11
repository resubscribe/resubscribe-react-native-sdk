import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import { reduceOpacity } from './util';

export const Button: React.FunctionComponent<{
    onPress: () => void;
    bgcolor?: string;
    color?: string;
    secondaryColor?: string;
    style?: any;
    children?: React.ReactNode;
}> = ({ onPress, bgcolor, color, secondaryColor, style, children }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.button,
                { backgroundColor: bgcolor || '#000', borderColor: secondaryColor ? reduceOpacity(secondaryColor, 0.3) : 'transparent' },
                style,
            ]}
        >
            <Text style={[styles.buttonText, { color: color || '#fff' }]}>{children}</Text>
        </TouchableOpacity>
    );
};

export const Backdrop: React.FunctionComponent<{
    isDark: boolean;
    className?: string;
} & React.PropsWithChildren> = ({
    isDark,
    className,
    children,
}) => {
        return (
            <Modal
                transparent={true}
                style={[
                    styles.backdrop,
                    ,
                ]}
            >
                <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
                    {children}
                </View>
            </Modal>
        );
    };

export const DialogModal: React.FunctionComponent<{
    backgroundColor?: string;
    color?: string;
    className?: string;
    children?: React.ReactNode;
}> = ({ backgroundColor, color, className, children }) => {
    return (
        <View style={[styles.modal]}>
            <View style={[styles.dialogInterior, { backgroundColor: backgroundColor || '#fff' }]}>
                {children}
            </View>
        </View>
    );
};

export const ChatModal: React.FunctionComponent<{
    backgroundColor?: string;
    className?: string;
    children?: React.ReactNode;
}> = ({ backgroundColor, className, children }) => {
    return (
        <View style={[styles.modal]}>
            <View style={[styles.chatInterior, { backgroundColor: backgroundColor || '#fff' }]}>
                {children}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    button: {
        display: 'flex',
        textAlign: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 6,
        cursor: 'pointer',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    backdrop: {
        position: 'absolute',
        zIndex: 9999,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogInterior: {
        padding: 20,
        borderRadius: 10,
    },
    chatInterior: {
        width: "100%",
        height: "100%",
    },
    text: {
        fontSize: 16,
    },
});