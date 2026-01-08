// domain/Barbeiro.java
package com.exemplo.barbearia.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "barbeiros")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Barbeiro {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    private String especialidade;
}
