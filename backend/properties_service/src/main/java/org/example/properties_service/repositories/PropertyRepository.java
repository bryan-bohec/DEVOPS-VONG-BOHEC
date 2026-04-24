package org.example.properties_service.repositories;



import org.example.properties_service.entitys.Property;
import org.example.properties_service.entitys.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityName(String cityName);

    List<Property> findByPropertyType(PropertyType type);

    List<Property> findByRentPriceLessThanEqual(Double maxPrice);

    List<Property> findByCityNameAndPropertyType(String cityName, PropertyType type);
}