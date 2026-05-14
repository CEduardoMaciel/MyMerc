import { StyleSheet } from 'react-native';
import { themeColors } from '../../ThemeContext';

type Theme = typeof themeColors.light;

export const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: theme.title,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.inputBorder,
        fontSize: 16,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: theme.inputBg,
        color: theme.text,
    },
    addBtn: {
        backgroundColor: theme.accent,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    list: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.surface,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.cardBorder,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemText: {
        fontSize: 16,
        color: theme.text,
    },
    suggestionBox: {
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: theme.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.inputBorder,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        zIndex: 1000,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
    },
    quantidadeText: {
        borderWidth: 1,
        borderColor: theme.inputBorder,
        fontSize: 16,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: theme.inputBg,
        color: theme.text,
    },
    headerGroup: {
        backgroundColor: theme.headerBg,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginTop: 15,
        marginBottom: 8,
        borderRadius: 6,
        borderLeftWidth: 5,
        borderLeftColor: theme.headerBorder,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    headerGroupText: {
        fontWeight: '900',
        color: theme.title,
        textTransform: 'uppercase',
        fontSize: 13,
        letterSpacing: 0.5
    },
});