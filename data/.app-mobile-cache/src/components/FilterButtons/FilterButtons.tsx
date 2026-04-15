import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export type FilterButtonsProps = {
  onFilter?: () => void;
  onRefresh?: () => void;
  onSort?: () => void;
  onShare?: () => void;
  activeFiltersCount?: number;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  row: {
    flexDirection: 'row'
  },
  buttonContainer: {
    position: 'relative',
    marginRight: 12
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  onFilter,
  onRefresh,
  onSort,
  onShare,
  activeFiltersCount = 0
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onFilter}
            style={{ borderColor: '#007AFF', marginRight: 12 }}
            labelStyle={{ color: '#007AFF' }}
          >
            ≡ Filtrar
          </Button>
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </View>
        <Button
          mode="outlined"
          onPress={onRefresh}
          style={{ borderColor: '#007AFF', marginRight: 12 }}
          labelStyle={{ color: '#007AFF' }}
        >
          ↻ Actualizar
        </Button>
        <Button
          mode="outlined"
          onPress={onSort}
          style={{ borderColor: '#007AFF', marginRight: 12 }}
          labelStyle={{ color: '#007AFF' }}
        >
          ↕ Ordenar
        </Button>
        <Button
          mode="outlined"
          onPress={onShare}
          style={{ borderColor: '#007AFF' }}
          labelStyle={{ color: '#007AFF' }}
        >
          ⤴ Compartir
        </Button>
      </View>
    </ScrollView>
  );
};
