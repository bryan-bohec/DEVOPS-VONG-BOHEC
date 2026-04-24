package org.example.properties_service.controllers;


import lombok.RequiredArgsConstructor;
import org.example.properties_service.entitys.Property;
import org.example.properties_service.entitys.PropertyType;
import org.example.properties_service.services.PropertyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public Property create(@RequestBody Property property) {
        return propertyService.create(property);
    }

    @GetMapping
    public List<Property> getAll() {
        return propertyService.getAll();
    }

    @GetMapping("/{id}")
    public Property getById(@PathVariable Long id) {
        return propertyService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }

    @GetMapping("/search/city")
    public List<Property> findByCity(@RequestParam String city) {
        return propertyService.findByCity(city);
    }

    @GetMapping("/search/type")
    public List<Property> findByType(@RequestParam PropertyType type) {
        return propertyService.findByType(type);
    }

    @GetMapping("/search/price")
    public List<Property> findByPrice(@RequestParam Double maxPrice) {
        return propertyService.findByPrice(maxPrice);
    }

    @GetMapping("/search")
    public List<Property> search(
            @RequestParam String city,
            @RequestParam PropertyType type
    ) {
        return propertyService.search(city, type);
    }
}