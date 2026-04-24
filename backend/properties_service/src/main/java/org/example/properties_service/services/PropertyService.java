package org.example.properties_service.services;





import lombok.RequiredArgsConstructor;
import org.example.properties_service.entitys.Property;
import org.example.properties_service.entitys.PropertyType;
import org.example.properties_service.repositories.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public Property create(Property property) {
        return propertyRepository.save(property);
    }

    public List<Property> getAll() {
        return propertyRepository.findAll();
    }

    public Property getById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    public void delete(Long id) {
        propertyRepository.deleteById(id);
    }

    public List<Property> findByCity(String city) {
        return propertyRepository.findByCityName(city);
    }

    public List<Property> findByType(PropertyType type) {
        return propertyRepository.findByPropertyType(type);
    }

    public List<Property> findByPrice(Double maxPrice) {
        return propertyRepository.findByRentPriceLessThanEqual(maxPrice);
    }

    public List<Property> search(String city, PropertyType type) {
        return propertyRepository.findByCityNameAndPropertyType(city, type);
    }
}